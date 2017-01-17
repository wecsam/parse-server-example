(function(data){
	var createOneUser = function(username, password, isPlus){
		var user = new Parse.User();
		user.set("username", username.toLowerCase());
		user.set("password", password);
		user.set("email", username + "@example.com");
		user.set("maxLevel", 1);
		user.set("runCondition", isPlus ? 2 : 1);
		user.signUp(null, {
			success: function(user) {
				console.log("Successfully created user: " + username + " - " + user.id);
			},
			error: function(user, error) {
				console.error("Unable to create user: " + username + ": " + error.code + " " + error.message);
			}
		});
	};
	var i, row, dataRows = data.split("\n");
	for(i = 0; i < dataRows.length; i++){
		if(dataRows[i].length){ // skip blank lines
			row = dataRows[i].split(",");
			try{
				createOneUser(row[0], row[1], row[2].indexOf("PLUS") >= 0);
			}catch(e){
				console.error(i, row, e.message);
			}
		}
	}
})(
	"blueeagle,salmon629,scratch\nredgorilla,pink161,scratch\norangefrog,purple216,scratch\nyelloweel,gold698,scratch\ngreenelephant,black319,scratch\nblueseal,white104,scratch\nindagopenguin,grey466,scratch\nvioletemu,silver181,scratch\nsalmondog,bronze630,scratch\npinkfalcon,amber672,scratch\npurpleferret,brown142,scratch\ngoldwhale,navy954,scratch\nblacktoad,beige435,scratch\nwhiteflamingo,red217,scratch\ngreylizard,orange376,scratch\nsilvertortoise,yellow956,scratch\nbronzegecko,green388,scratch\nambergerbil,blue657,scratch\nbrownclam,indago802,scratch\nnavypanda,violet177,scratch\nbeigesnail,salmon172,scratch\nredgiraffe,pink704,scratch\norangeworm,purple676,scratch\nyellowgoat,gold649,scratch\ngreenroose,black833,scratch\nbluegopher,white115,scratch\nindagopig,salmon136,scratch\nvioletshark,pink618,scratch\nsalmonhare,purple425,scratch\npinkhamster,gold867,scratch\npurplecrab,black168,scratch\ngoldbeetle,white189,scratch\nblackhippo,grey440,scratch\nwhitehorse,silver636,scratch\ngreymonkey,bronze149,scratch\nsilverduck,amber205,scratch\nbronzedeer,brown880,scratch\nambermouse,navy367,scratch\nbrowndolphin,beige525,scratch\nnavyalligator,red353,scratch\nbeigecrocodile,orange530,scratch\nredcamel,yellow825,scratch\norangecaterpiller,green342,scratch\nyellowchameleon,blue575,scratch\ngreenchimp,indago949,scratch\nbluecougar,violet781,scratch\nindagocoyote,salmon392,scratch\nvioletbutterfly,pink119,scratch\nsalmonbull,purple401,scratch\npinkspider,gold657,scratch\npurplebison,black467,scratchPLUS\ngoldowl,white703,scratchPLUS\nblackant,salmon535,scratchPLUS\nwhiteantelope,pink466,scratchPLUS\ngreyarmadillo,purple896,scratchPLUS\nsilverrabbit,gold135,scratchPLUS\nbronzerat,black793,scratchPLUS\nambersnake,white503,scratchPLUS\nbrownsalamander,grey410,scratchPLUS\nnavymoth,silver328,scratchPLUS\nbeigeporcupine,bronze59,scratchPLUS\nredpossum,amber546,scratchPLUS\norangeotter,brown409,scratchPLUS\nyellowoyster,navy560,scratchPLUS\ngreenostrich,beige820,scratchPLUS\nblueoctopus,red495,scratchPLUS\nindagosquid,orange663,scratchPLUS\nvioletocelot,yellow705,scratchPLUS\nsalmonnewt,green922,scratchPLUS\npinkmole,blue533,scratchPLUS\npurplemule,indago836,scratchPLUS\ngoldwalrus,violet306,scratchPLUS\nblackwasp,salmon688,scratchPLUS\nwhitebuffalo,pink120,scratchPLUS\ngreydragon,purple700,scratchPLUS\nsilverweasel,gold612,scratchPLUS\nbronzecorgi,black160,scratchPLUS\namberwombat,white992,scratchPLUS\nbrownzebra,salmon794,scratchPLUS\nnavyyak,pink754,scratchPLUS\nbeigevulture,purple921,scratchPLUS\nredraccoon,gold575,scratchPLUS\norangewolf,black774,scratchPLUS\nyellowsheep,white613,scratchPLUS\ngreenlamb,grey639,scratchPLUS\nbluechicken,silver470,scratchPLUS\nindagosparrow,bronze744,scratchPLUS\nvioletsquirrel,amber337,scratchPLUS\nsalmonstarfish,brown101,scratchPLUS\npinkstingray,navy545,scratchPLUS\npurplejellyfish,beige100,scratchPLUS\ngoldlemur,red562,scratchPLUS\nblackladybug,orange653,scratchPLUS\nwhiteliger,yellow900,scratchPLUS\ngreylynx,green325,scratchPLUS\nsilverinsect,blue537,scratchPLUS\nbronzeowl,indago93,scratchPLUS\namberant,violet899,scratchPLUS\nbrownantelope,black899,scratchPLUS\nnavyarmadillo,pink688,scratchPLUS\n" +
	"navybear,red123,Scratch\nnavydog,red456,Scratch\nnavytiger,red789,Scratch\nnavylion,blue123,Scratch\nnavybird,blue456,Scratch\nnavysnake,blue789,Scratch\nnavyspider,purple124,Scratch\nnavymole,green343,Scratch\nnavyhorse,brown101,Scratch\nnavyfish,navy545,scratchPLUS\nnavyseal,beige100,scratchPLUS\nnavypenguin,red562,scratchPLUS\nblackcat,orange653,scratchPLUS\nblacksnake,yellow900,scratchPLUS\nblackseal,green325,scratchPLUS\nblackpenguin,pink754,scratchPLUS\nblackotter,purple921,scratchPLUS\nsilverfox,gold123,scratchPLUS\n" +
	"test1,cathy2016,scratch\ntest2,cathy2017,scratchPLUS\ntest3,cathy2018,scratch\ntest4,cathy2019,scratchPLUS\ntest5,cathy2020,scratch\ntest6,cathy2021,scratchPLUS\ntest7,cathy2022,scratch\ntest8,cathy2023,scratchPLUS\ntest9,cathy2024,scratch\ntest10,cathy2025,scratchPLUS\ntest11,cathy2026,scratch\ntest12,cathy2027,scratchPLUS\ntest13,cathy2028,scratch\ntest14,cathy2029,scratchPLUS\ntest15,cathy2030,scratch\ntest16,cathy2031,scratchPLUS\nlaura1,cathy2032,scratch\nlaura2,cathy2033,scratch\nlaura3,cathy2034,scratch\nlaura4,cathy2035,scratch\nlaura5,cathy2036,scratch\nlaura6,cathy2037,scratchPLUS\nlaura7,cathy2038,scratchPLUS\nlaura8,cathy2039,scratchPLUS\nlaura9,cathy2040,scratchPLUS\nlaura10,cathy2041,scratchPLUS\nali1,cathy2042,scratch\nali2,cathy2043,scratch\nali3,cathy2044,scratch\nali4,cathy2045,scratch\nali5,cathy2046,scratch\nali6,cathy2047,scratchPLUS\nali7,cathy2048,scratchPLUS\nali8,cathy2049,scratchPLUS\nali9,cathy2050,scratchPLUS\nali10,cathy2051,scratchPLUS\njenna1,cathy2052,scratch\njenna2,cathy2053,scratch\njenna3,cathy2054,scratch\njenna4,cathy2055,scratch\njenna5,cathy2056,scratch\njenna6,cathy2057,scratchPLUS\njenna7,cathy2058,scratchPLUS\njenna8,cathy2059,scratchPLUS\njenna9,cathy2060,scratchPLUS\njenna10,cathy2061,scratchPLUS\nmarianna1,cathy2062,scratch\nmarianna2,cathy2063,scratch\nmarianna3,cathy2064,scratch\nmarianna4,cathy2065,scratch\nmarianna5,cathy2066,scratch\nmarianna6,cathy2067,scratchPLUS\nmarianna7,cathy2068,scratchPLUS\nmarianna8,cathy2069,scratchPLUS\nmarianna9,cathy2070,scratchPLUS\nmarianna10,cathy2071,scratchPLUS\n"
);