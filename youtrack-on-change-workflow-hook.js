
const entities = require('@jetbrains/youtrack-scripting-api/entities');
const http = require('@jetbrains/youtrack-scripting-api/http');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  // TODO: give the rule a human-readable title
  title: 'Youtrack-send-issue',
  guard: (ctx) => {
    // TODO specify the conditions for executing the rule
    return true;
  },
  action: (ctx) => {
    const issue = ctx.issue;
    let user = issue.fields.Assignee;
    if (!user) {
      user = issue.project.leader;
    }
    const connection = new http.Connection('https://webhook.site');
    connection.addHeader('Content-Type', 'application/json');
    const response = connection.postSync('/your-hook', [], {
      id:issue.id,
      url:issue.url,
      reporter:ctx.issue.reporter.email,
      projectName:issue.project.name||'-',
      state: issue.State.name ||'-',
      description:issue.description||'-',
      Assignee:user.email,
      userFullName:user.fullName,
      summary:issue.summary,

    });
    workflow.message('Синхронизация изменений в гитлаб....');
  },
  requirements: {
    // TODO: add requirements
  }
});
