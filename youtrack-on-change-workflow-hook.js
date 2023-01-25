

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const http = require('@jetbrains/youtrack-scripting-api/http');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  // TODO: give the rule a human-readable title
  title: 'Youtrack-send-issue',
  guard: (ctx) => {
    const issue = ctx.issue;
    // TODO specify the conditions for executing the rule
    return ctx.issue.isReported;
  },
  runOn:'change',
  action: (ctx) => {
    const issue = ctx.issue;
    let user = issue.fields.Assignee;
    if (!user) {
      user = issue.project.leader;
    }
    const connection = new http.Connection('https://webhook.site');
    connection.addHeader('Content-Type', 'application/json');
    connection.addHeader('x-youtrack-token', '123321');
    const response = connection.postSync('/542b1294-60f7-4573-923a-e3a97172411a', [], {
      id:issue.id,
      url:issue.url,
      reporter:ctx.issue.reporter.email,
      projectName:issue.project.name||'-',
      state: issue.State.name ||'-',
      description:issue.description||'-',
      Assignee:user.email,
      userFullName:user.fullName,
      summary:issue.summary || '-----',
      tags:ctx.issue.tags ||[]

    });
    workflow.message('Синхронизация изменений в гитлаб....');
  },
  requirements: {
    // TODO: add requirements
  }
});
