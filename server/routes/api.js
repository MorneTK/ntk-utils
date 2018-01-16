const url       = require( 'url' );
const express   = require( 'express' );
const router    = express.Router();
const request   = require( 'request-promise' );
const cheerio   = require( 'cheerio' );
const redis     = require( 'redis' );
const rdsClient = redis.createClient();
const expireIn  = 604800;

router.get( '/search', async ( req, res ) => {
  const data = await doSearch( req );
  res.json( data );
});

async function doSearch( req ) {
  let totalLinks = 0;
  const params = getParams( req );
  const uLinks = [];
  const terms  = escapeTerms( params.terms );
  const regex  = new RegExp( `(${terms})`, 'i' );

  try {
    for( let i = 0; i < 10; i++ ) {
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
          rdsClient.expire( link, expireIn );
        }

        const $ = cheerio.load( linkHtml );
        const body = $( 'body' ).html();

        if ( regex.test( body ) ) { uLinks.push( link ); }
      }
    }
  } catch( ex ) {
    // no-op -- expecting this to 404 after the last page is reached
  }

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

function escapeTerms( terms ) {
  const termsArray = terms.split( /,/ );
  const newTerms = []

  for ( const idx in termsArray ) {
    let newTerm = termsArray[idx];
    newTerm = newTerm.replace( /\\/g, "\\\\" );
    newTerm = newTerm.replace( /\[/g, "\\[" );
    newTerm = newTerm.replace( /\]/g, "\\]" );
    newTerm = newTerm.replace( /\(/g, "\\(" );
    newTerm = newTerm.replace( /\)/g, "\\)" );
    newTerm = newTerm.replace( /\*/g, "\\*" );
    newTerm = newTerm.replace( /\//g, "\\/" );
    newTerm = newTerm.replace( /\./g, "\\." );
    newTerm = newTerm.replace( /\|/g, "\\|" );
    newTerm = newTerm.replace( /\?/g, "\\?" );
    newTerm = newTerm.replace( /\+/g, "\\+" );
    newTerm = newTerm.replace( /\-/g, "\\-" );
    newTerm = newTerm.replace( /\{/g, "\\{" );
    newTerm = newTerm.replace( /\}/g, "\\}" );
    newTerm = newTerm.replace( /\^/g, "\\^" );
    newTerm = newTerm.replace( /\>/g, "\\>" );
    newTerm = newTerm.replace( /\</g, "\\<" );
    newTerms.push( newTerm );
  }

  return newTerms.join( '|' );
}

module.exports = router;
