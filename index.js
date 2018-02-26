// import clubsShortname from '/build/clubsObjShortName.json';

var fs = require('fs');
// const clubsShortname = require('build/clubsObjShortName.json');
// module.exports = {
// 	clubsObjShortName: require(__dirname + '/build/clubsObjShortName.json')
// };

const request = require('superagent');
const clubsShortname = require( "./build/clubsObjShortName.json" );

function updateVersion() {
  	const host = process.env.FX_API || 'http://dev.ttab.me:51167';
  	const v = process.env.FX_VERSION || 'v1';
  
	const url = `${host}/${v}/version`;

	// const accessToken = localStorage.getItem('access_token');
	const getDownloadUrl = (delay, tries, error) => {
	  if (tries < 1) {
	    return null;
	  }

	  return request
	    .get(url)
	    .set('Content-Type', 'application/x-www-form-urlencoded')
	    // .set('Authorization', `Bearer ${accessToken}`)
	    .query({}) // query string
	    .then((res, err) => {
	      	if (!err) {
	        	let dispatchData = res.body.data[0];
	        	return dispatchData.url;
	      	} else {
	      		return setTimeout(() => getDownloadUrl(delay + 2000, tries - 1, res.body.message), delay);	
	      	}
	    })
	    .catch((err) => {
	    	console.log(err);
	      	console.log(`Error in ${type}`);
	      	return null;
	    });
	};

	getDownloadUrl(1000, 3).then(nextUrl => {
		request.get(nextUrl).buffer(true).then((res, err) => {
			const contentData = JSON.parse(res.text);
			let { clubs, areas, leagues, groups, group_membership_configs, exchange_rates, version } = contentData;
			clubs = clubs.map(club => {
				club.short_name = clubsShortname[club.name].short_name;
				return club;
			});
			
			updateObjFile('clubs', clubs);
			updateObjFile('groups', groups);
			updateObjFile('leagues', leagues);
			updateObjFile('areas', areas);

			updateArrFile('clubs', clubs);
			updateArrFile('groups', groups);
			updateArrFile('leagues', leagues);
			updateArrFile('areas', areas);
		})
	})
}

const updateObjFile = (name, data) => {
	const json = data.reduce((json, value, key) => { json[value.id] = value; return json; }, {});
	fs.writeFile(`build/${name}Obj.json`, JSON.stringify(json), 'utf8', () => {
		console.log(`build/${name}Obj.json: OK`);
	});
}

const updateArrFile = (name, data) => {
	fs.writeFile(`build/${name}Arr.json`, JSON.stringify(data), 'utf8', () => {
		console.log(`build/${name}Arr.json: OK`);
	});
}

updateVersion();