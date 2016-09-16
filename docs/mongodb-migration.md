# MongoDB Migration Work

## Things to consider:

* build index based off common queries. writes will have bad performance if there are many indexes 


## database models and Cloudant <-> MongoDB schema mapping


### users
| Fields        | Details       | cloudant field
| ------------- |:-------------:|-------------
| userId | (UNIQUE ID) string. for IBM it's CNUM or perhaps shortEmail? | n/a
| adminAccess | 'none' or 'full' or 'read' or 'write'| n/a
| email | string; for IBM it's pref. ID | n/a
| name  | string' first and last name of person | n/a
| lastLogin | JS Date Object| n/a


### iterations
| Fields        | Details      | cloudant field | cloudant value ex (if not obv.)
| ------------- |:-------------:|------------- | -------------
|name | string | iteration_name |
|teamId | objectId of team | team_id |
|status| 'completed' or 'in progress' | iterationinfo_status |"Not complete", "Completed"
|createDate|JS Date Object | created_dt | "2016-04-12 08:58:50 EDT"
|createdById| string of userId | created_user |
|createdBy| string of name or email | created_user |
|updateDate| JS Date Object | last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById| string of userId | last_updt_user |
|updatedBy| string of name or email | last_updt_user |
|startDate| JS Date Object|iteration_start_dt | "01/15/2016"
|endDate| JS Date Object|iteration_end_dt | "01/16/2016"
|committedStories| integer | nbr_committed_stories |
|deliveredStories| integer | nbr_stories_dlvrd |
|locationScore | used for pizza chart i think ?? | fte_cnt | 0.0 or 0.5 
|deployments | integer | nbr_dplymnts | "" or 1
|defects | integer | nbr_defects | "" or 2
|clientSatisfaction| integer | client_sat | 1.0
|teamSatisfaction| integer | team_sat | 4
|comment| string | iteration_comments |
|memberChanged| boolean, use: ?? | team_mbr_change | "No"


### teams (bottom up tree structure)
Possible tree structure pattern to explore:
* [Model Tree Structures with an Array of Ancestors]
* [Model Tree Structures with Materialized Paths] <- use this one
* [Model Tree Structures with Parent References]

in cloudant it currently looks like each team has all it's ancestors. Also each team knows about all it's immediate children.
This seems problematic when it comes to updating tree structure and removing subtrees.
I was thinking it might be easier to map the data as is and worry about this later :)


use team name in path to make it readable. enforce no duplicate team name case insensitive


"type": "team"
| Fields        | Details       | mongo ex    | cloudant field | cloudant value ex
| ------------- |:-------------:|-------------|-------------|-------------
| path | string | ",CIO,Agile Team," | parents  |  ["CIO", "Agile Team"]
| members       | array of objects| [{userId:'5G22944', name:'billy bob', allocation:'100', role:"Developer"}] | members | [{key,id,name,allocation,role}]
|type           | string | "", "squad", "domain", "tribe", "subDomain", "potato" | squadteam     | "Yes" or "No"
|createDate     | JS Date Object | |created_dt | "2016-04-12 08:58:50 EDT"
|createdById    | string of userId | | created_user |
|createdBy      | string of name or email | | created_user |
|updateDate     | JS Date Object | |last_updt_dt | "2016-04-27 04:53:23 EDT"
|updatedById    | string of userId | |last_updt_user |
|updatedBy      | string of name or email | |last_updt_user |



ex cloudant doc:
```
{
	"id": "ag_team_AcquisitionCustomerMatching_1463146469675",
	"key": "ag_team_AcquisitionCustomerMatching_1463146469675",
	"value": {
		"rev": "2-eae4f4a22969d1a4f16fc054a4afbeb1"
	},
	"doc": {
		"_id": "ag_team_AcquisitionCustomerMatching_1463146469675",
		"_rev": "2-eae4f4a22969d1a4f16fc054a4afbeb1",
		"type": "team",
		"name": "Acquisition Customer Matching",
		"desc": "",
		"squadteam": "Yes",
		"last_updt_dt": "2016-05-13 21:34:29 SGT",
		"last_updt_user": "batch",
		"created_dt": "2016-05-13 21:34:29 SGT",
		"created_user": "batch",
		"parent_team_id": "ag_team_Acquisitions",
		"members": [{
			"key": "024313672",
			"id": "Syeda.IqanZahera.Naqvi@in.ibm.com",
			"name": "SYEDA I (SYEDA) NAQVI",
			"allocation": 100,
			"role": "Developer"
		}, {
			"key": "061442672",
			"id": "girisbho@in.ibm.com",
			"name": "GIRISH B (GIRISH) BHOLE",
			"allocation": 100,
			"role": "Developer"
		}, {
			"key": "038187672",
			"id": "cecilia.ljunghill@se.ibm.com",
			"name": "Cecilia Ljunghill",
			"allocation": 100,
			"role": "Developer"
		}, {
			"key": "1A54FSIN1",
			"id": "cx1a54fs@in.ibm.com",
			"name": "Subramanian *CONTRACTOR* V",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "L07478897",
			"id": "william_seaward@us.ibm.com",
			"name": "William W. Seaward",
			"allocation": 100,
			"role": "Architect"
		}, {
			"key": "2913FSIN1",
			"id": "cx2913fs@in.ibm.com",
			"name": "Dharmendra *CONTRACTOR* Sahani",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "4E91FSIN1",
			"id": "cx4e91fs@in.ibm.com",
			"name": "Hema *CONTRACTOR* R U",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "050761781",
			"id": "michel.taront@fr.ibm.com",
			"name": "Michel Taront",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "5D4735897",
			"id": "iloutfi@us.ibm.com",
			"name": "IMAD A. LOUTFI",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "1A53FSIN1",
			"id": "cx1a53fs@in.ibm.com",
			"name": "Tulasi Rao *CONTRACTOR* Kannuri",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "C-DNGN897",
			"id": "kacerik@us.ibm.com",
			"name": "Veronica *CONTRACTOR* Kacerik",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "C-5KCS897",
			"id": "hossainm@us.ibm.com",
			"name": "Mohammad *CONTRACTOR* Hossain",
			"allocation": 100,
			"role": "Consultant"
		}, {
			"key": "042424781",
			"id": "KUTUKAKE@jp.ibm.com",
			"name": "Masaki Kutsukake",
			"allocation": 100,
			"role": "Analyst"
		}, {
			"key": "C-D52S897",
			"id": "cmugaas@us.ibm.com",
			"name": "Carol *CONTRACTOR* Mugaas",
			"allocation": 100,
			"role": "Analyst"
		}],
		"child_team_id": []
	}
},
```


### assessments
| Fields        | Details           
| ------------- |:-------------:
|

### snapshots (roll-up data)
| Fields        | Details           
| ------------- |:-------------:
|

## Proposed work
* Use Mongoose
* Have alternate versions of assessment.js, iteration.js, snapshot.js, teams.js and users.js in a new model directory
* Move validation from validate.js -> [using mongoose schema validation]
* Use mongoose default fields and remove the various default data spread throughout the project (e.x public/index.js ~L5->114)

###Steps
1. Migrate data
  1. ```$ curl http://admin:pass@domain/dbName/_all_docs?include_docs=true > docs.json  ``` get all docs
  2. run scripts using a mongo driver over docs to save into compose
2. Develop models with migrated data

## References

 * [Modelling tree structures]

[Modelling tree structures]: <https://docs.mongodb.com/manual/applications/data-models-tree-structures/>
[using mongoose schema validation]: <http://mongoosejs.com/docs/validation.html>
[Model Tree Structures with Materialized Paths]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-materialized-paths/>
[Model Tree Structures with an Array of Ancestors]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-ancestors-array/>
[Model Tree Structures with Parent References]: <https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-parent-references/>
