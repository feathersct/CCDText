/**
	This javascript object will get all the text for a CCD and put into a json object for easier parsability. 
	@author Clayton Feathers
	@method setCCDText

	-----------------------------------
	--- Documentation for Usability ---
	-----------------------------------
	
	Use this once in your channel to access it multiple times by using a channelMap variable

	1. create a CCDText variable and set the ccd message (root element must be <ClinicalDocument>)
	2. Use that variable to access Allergies, Encounters, Immunizations, etc.

	Example:

	var ccdText = new CCDText()
	ccdText.setCCD(msg);
	
	channelMap.put('ccdText', ccdText);


	Then in proceding steps/code:
	$('ccdText').getField('Allergies', z, 'Allergy')
				   		 ^	     ^	  ^
			     	   domain   index columnName
	

	Notes:
	 - column name will change depending on the table headers for each component
	 - domain will always be the same through out 
	 - domains currently supported: 
			Problems
			Medications
			Allergies
			Immunizations
			Vitals
			Procedures
			Encounters
			Insurances
			Labs
	
*/


function CCDText() {
	this.domains = {}; // domains are going to hold values; ex. text['Vitals'][z]['Vital Name']
}

// Returns and sets the json element for all the texts for each component in a ccd
CCDText.prototype.setCCD = function(CCDTxt) {
	var domainMap = {
		'11450-4': 'Problems',
		'10160-0': 'Medications',
		'48765-2': 'Allergies',
		'11369-6': 'Immunizations',
		'8716-3': 'Vitals',
		'47519-4': 'Procedures',
		'46240-8': 'Encounters',
		'48768-6': 'Insurances',
		'30954-2': 'Labs'
	};

	for each(var component in CCDTxt['component']['structuredBody']['component'])
	{
		var code = component['section']['code']['@code'];
		var domain = domainMap[code];

		// If code is in the domainMap then process
		if(domain)
		{
			// if a table is there
			if(!isNullOrEmpty(component['section']['text']['table'].toString()))
			{
				// Get the json values for this component
				var domainJson = getTextForDomain(component['section']['text']['table'].toString())

				// Add it to the overall domain
				this.domains[domain]= domainJson;
			}
		}
	}

	return this.domains;
}

CCDText.prototype.getField = function(domain, index, columnName) {
	
	var value = '';
	try{
		value = this.domains[domain][index][column];
	}
	catch(ex){}

	return value;
}


function getTextForDomain(textStr){
	
	var text = new XML(textStr);
	
	// Set the Header elements
	var index = 0;
	var jsonVariable = {};
	var jsonIndex = {};
	var values = [];

	// Get headers and index
	try{
			
		if(!isNullOrEmpty(text.*::['thead'].*::['tr']))
		{
			for each(var td in text.*::['thead'].*::['tr'][0].*::['td'])
			{
				jsonVariable[td.toString()] = index.toString()
				jsonIndex[index.toString()] = td.toString()
				index++;
			}
		
			// if not td then try th
			if(isNullOrEmpty(text.*::['thead'].*::['tr'][0].*::['td']))
			{
				for each(var td in text.*::['thead'].*::['tr'][0].*::['th'])
				{
					jsonVariable[td.toString()] = index.toString()
					jsonIndex[index.toString()] = td.toString()
					index++;
				}	
			}
		
			// Set the Values
			for each(var tr in text.*::['tbody'].*::['tr'])
			{
				var jsonBody = {};
				var i = 0;
				for each(var td in tr.*::['td'])
				{
					var name = jsonIndex[i];
					var value = td.toString();
		
					jsonBody[name] = value;
					i++;
				}
		
				values.push(jsonBody);
			}
		}
	}
	catch(ex)
	{
		logger.error('Could not parse CCD text for ' + textStr);
	}
	

	return values;
}
