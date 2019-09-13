/* exported Script */

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/* set filters here */
var labelMatch = ["security/aporeto", "security"];
var filePathMatch = ["security"];


/* perform label matching */
var labelExists = false; 

function searchLabelMatch(labels) {

  for(var i=0;i < labelMatch.length;i++)   {
      if(labels.indexOf(labelMatch[i]) != -1){
          return labelExists = true; 
      }
  }
return  labelExists = false ;
}

const getLabelsField = (labels) => {
  let labelsArray = [];
  labels.forEach(function(label) {
    labelsArray.push(label.name);
  });
  labelsArray = labelsArray.join(', ');
  return {
    title: 'Labels',
    value: labelsArray,
    short: labelsArray.length <= 40
  };
  };

/* perform  path matching */
var filePathExists = false; 

function searchFilePathMatch(files) {
  for(var i=0;i < filePathMatch.length; i++)   {
      testFileMatch = ".*" + filePathMatch[i] + ".*";
      for(var g=0; g < files.length; g++){
        if(files[g].match(testFileMatch) != null){
            return filePathExists = true; 
          }
      }
  }
return  filePathExists = false ;
}



const getFilePaths = (files) => {
let filePathArray = [];
files.forEach(function(files) {
  filePathArray.push(files);
});
filePathArray = filePathArray.join(', ');
return {
  title: 'Files',
  value: filePathArray,
  short: filePathArray.length <= 40
};
};

const githubEvents = {
ping(request) {
  return {
    content: {
      text: '_' + request.content.hook.id + '_\n' + ':thumbsup: ' + request.content.zen
    }
  };
},

/* NEW OR MODIFY ISSUE */
issues(request) {
  const user = request.content.sender;
  /* console.log("New or Modify Issue"); */
  labels = getLabelsField(request.content.issue.labels).value;
  labelExists = searchLabelMatch(labels);
  if (labelExists == true )
  {
        if (request.content.action == "opened" || request.content.action == "reopened" || request.content.action == "edited") {
            var body = request.content.issue.body;
        } else if (request.content.action == "labeled") {
            var body = "Current labels: " + getLabelsField(request.content.issue.labels).value;
        } else if (request.content.action == "assigned" || request.content.action == "unassigned") {
            // Note that the issues API only gives you one assignee.
            var body = "Current assignee: " + request.content.issue.assignee.login;
        } else if (request.content.action == "closed") {
            if (request.content.issue.closed_by) {
                var body = "Closed by: " + request.content.issue.closed_by.login;
            } else {
                var body = "Closed.";
            }
        } else {
            return {
              error: {
                success: false,
                message: 'Unsupported issue action'
              }
            };
        }

  const action = request.content.action.capitalizeFirstLetter();

  const text = '_' + request.content.repository.full_name + '_\n' +
              '**[' + action + ' issue ​#' + request.content.issue.number +
              ' - ' + request.content.issue.title + '](' +
              request.content.issue.html_url + ')**\n\n' +
              body;

  return {
    content: {
      attachments: [
          {
              thumb_url: user.avatar_url,
              text: text,
              fields: []
          }
      ]
    }
  };
  }
  else {
    console.log("Label did not match")
  }

},

/* COMMENT ON EXISTING ISSUE */
issue_comment(request) {
  const user = request.content.comment.user;
  labels = getLabelsField(request.content.issue.labels).value;
  labelExists = searchLabelMatch(labels);
  /* console.log("Comment on Existing Issue"); */
  if (labelExists == true)
  {
          if (request.content.action == "edited") {
              var action = "Edited comment ";
          } else {
              var action = "Comment "
          }

          const text = '_' + request.content.repository.full_name + '_\n' +
                      '**[' + action + ' on issue ​#' + request.content.issue.number +
                      ' - ' + request.content.issue.title + '](' +
                      request.content.comment.html_url + ')**\n\n' +
                      request.content.comment.body;

          return {
            content: {
              attachments: [
                  {
                      thumb_url: user.avatar_url,
                      text: text,
                      fields: []
                  }
              ]
            }
          };
        }
    else {
      console.log("Label did not match")
    }
},

/* COMMENT ON COMMIT */
commit_comment(request) {
  const user = request.content.comment.user;
  /* console.log("Comment on Commit"); */

  if (request.content.action == "edited") {
      var action = "Edited comment ";
  } else {
      var action = "Comment "
  }

  const text = '_' + request.content.repository.full_name + '_\n' +
              '**[' + action + ' on commit id ' + request.content.comment.commit_id +
              ' - ' +  + '](' +
              request.content.comment.html_url + ')**\n\n' +
              request.content.comment.body;

  return {
    content: {
      attachments: [
          {
              thumb_url: user.avatar_url,
              text: text,
              fields: []
          }
      ]
    }
  };
},
/* END OF COMMENT ON COMMIT */

/* PUSH TO REPO */
push(request) {
  //console.log("Push to Repo");
  let files_added = [];
  files_added = request.content.head_commit.added;  
  files_removed = request.content.head_commit.removed;
  files_modified = request.content.head_commit.modified;
  let files = []; 

  files = files.concat(files_added, files_removed, files_modified);
  filePathExists = searchFilePathMatch(files);
  //console.log("Value of match:" + filePathExists);*/
  if (filePathExists){
      var commits = request.content.commits;
      var multi_commit = ""
      var is_short = true;
      var changeset = 'Changeset';
      if ( commits.length > 1 ) {
        var multi_commit = " [Multiple Commits]";
        var is_short = false;
        var changeset = changeset + 's';
        var output = [];
      }
      const user = request.content.sender;

      var text = '**Pushed to ' + "["+request.content.repository.full_name+"]("+request.content.repository.url+"):"
                  + request.content.ref.split('/').pop() + "**\n\n";

      for (var i = 0; i < commits.length; i++) {
        var commit = commits[i];
        var shortID = commit.id.substring(0,7);
        var a = '[' + shortID + '](' + commit.url + ') - ' + commit.message;
        if ( commits.length > 1 ) {
          output.push( a );
        } else {
          var output = a;
        }
      }

      if (commits.length > 1) {
        text += output.reverse().join('\n');
      } else {
        text += output;
      }

      return {
        content: {
          attachments: [
              {
                  thumb_url: user.avatar_url,
                  text: text,
                  fields: []
              }
          ]
        }
      };
    }
    /*else{
      console.log("Push does not match search string.");
    }*/
},  // End GitHub Push

/* NEW PULL REQUEST */
pull_request(request) {
  const user = request.content.sender;
  /* console.log("New Pull Request"); */

 if (request.content.action == "opened" || request.content.action == "reopened" || request.content.action == "edited" || request.content.action == "synchronize") {
      var body = request.content.pull_request.body;
  } else if (request.content.action == "labeled") {
      var body = "Current labels: " + getLabelsField(request.content.pull_request.labels).value;
  } else if (request.content.action == "assigned" || request.content.action == "unassigned") {
      // Note that the issues API only gives you one assignee.
      var body = "Current assignee: " + request.content.pull_request.assignee.login;
  } else if (request.content.action == "closed") {
      if (request.content.pull_request.merged) {
          var body = "Merged by: " + request.content.pull_request.merged_by.login;
      } else {
          var body = "Closed.";
      }
  } else {
      return {
        error: {
          success: false,
          message: 'Unsupported pull request action'
        }
      };
  }

  const action = request.content.action.capitalizeFirstLetter();

  const text = '_' + request.content.repository.full_name + '_\n' +
              '**[' + action + ' pull request ​#' + request.content.pull_request.number +
              ' - ' + request.content.pull_request.title + '](' +
              request.content.pull_request.html_url + ')**\n\n' +
              body;

  return {
    content: {
      attachments: [
          {
              thumb_url: user.avatar_url,
              text: text,
              fields: []
          }
      ]
    }
  };
},
};

class Script {
process_incoming_request({ request }) {
  /* console.log("Process Request Start"); */
  
  const header = request.headers['x-github-event'];
  if (githubEvents[header]) {
    return githubEvents[header](request);
  }

  return {
    error: {
      success: false,
      message: 'Unsupported method'
    }
  };
  /* console.log("Process Request End"); */
}
}