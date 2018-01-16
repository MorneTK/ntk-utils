const url       = require( 'url' );
const express   = require( 'express' );
const router    = express.Router();
const request   = require( 'request-promise' );
const cheerio   = require( 'cheerio' );
const redis     = require( 'redis' );
const rdsClient = redis.createClient();

router.get( '/search', async ( req, res ) => {
  const data = await doSearch( req );
  console.log( data.totalLinks );
  res.json( data );
});

async function doSearch( req ) {
  let totalLinks = 0;
  const params = getParams( req );
  const uLinks = [];
  const regex  = new RegExp( `(${params.terms})`, 'i' );

  console.log( `Searching with: ${regex}` );

  try {
    for( let i = 0; i < 20; i++ ) {
      const parentLink = `${params.baseLink}/index${ i > 0 ? i : '' }.html`;
      const loadedHtml = await fetchHtml( parentLink, true );
      const allLinks   = getLinksOnPage( loadedHtml );

      for( const j in allLinks ) {
        totalLinks++;
        const link = `${params.baseLink}/${allLinks[j]}`;
        let   linkHtml = await getFromRedis( link );

        if ( !linkHtml || linkHtml.length === 0 ) {
          linkHtml = await fetchHtml( link );
          rdsClient.set( link, linkHtml );
        }

        if ( regex.test( linkHtml ) ) { uLinks.push( link ); }
      }
    }
  } catch( ex ) {
    // no-op
  }

  console.log( `Relevant Link count: ${uLinks.length}` );

  return { uLinks: uLinks, totalLinks: totalLinks };
}

function fetchHtml( link, doTransform ) {
  let options = { uri: link };
  if ( doTransform ) {
    options.transform = function( body ) { return cheerio.load( body ); }
  }

  return request( options );
}

function getLinksOnPage( page ) {
	const links = [];
	page( 'a' ).each( function() { links.push( page( this ).attr( 'href' ) ); });
	const uLinks = [];

	for( const i in links ) {
		if ( i % 4 === 0 ) { uLinks.push( links[i] ); }
	}

	return uLinks;
}

function getParams( req ) {
  return url.parse( req.url, true ).query;
}

async function getFromRedis( key ) {
  return new Promise(( resolve, reject ) => {
    rdsClient.get( key, function( err, rep ) {
      if ( err ) {
        reject( err );
      } else {
        resolve( rep || '' );
      }
    });
  });
}

module.exports = router;
