const entities = require('@jetbrains/youtrack-scripting-api/entities');
const http = require('@jetbrains/youtrack-scripting-api/http');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const TrackedFields = [{

  name: 'summary',
  isChanged: (issue) => (issue.summary !== issue.oldValue('summary'))

},
  {

    name: 'description',
    isChanged: (issue) => (issue.description !== issue.oldValue('description'))

  },
  {
    name: 'Assignee',
    isChanged: (issue) => (issue.oldValue('Assignee') !== null),
    getOldValue: (issue) => ((issue.oldValue('Assignee') && issue.oldValue('Assignee')!==null && issue.oldValue('Assignee').email) ||''),
    getValue: (issue) => ((issue.fields.Assignee && issue.fields.Assignee.email && issue.fields.Assignee.email) ||'')

  },
  {
    name: 'State',
    isChanged: (issue) => (issue.oldValue("State")!== null),
    getOldValue: (issue) => (issue.oldValue("State").name),
    getValue: (issue) => (issue.State.name)

  },



];
exports.rule = entities.Issue.onChange({
  // TODO: give the rule a human-readable title
  title: 'Youtrack-send-issue',
  guard: (ctx) => {
    const issue = ctx.issue;
    // TODO specify the conditions for executing the rule

    return ctx.issue.isReported;
  },
  runOn: 'change',
  action: (ctx) => {
    const issue = ctx.issue;
    let user = issue.fields.Assignee;
    if (!user) {
      user = issue.project.leader;
    }
    const connection = new http.Connection('https://webhook.site');
    connection.addHeader('Content-Type', 'application/json');
    connection.addHeader('x-youtrack-token', '123321');

    let changes = [];
    for (let i = 0; i < TrackedFields.length; i++) {
      const field = TrackedFields[i];
      const issueKey = field.name;
      if (!field.isChanged(issue)) {
        continue;
      }
      let oldValue;
      let newValue;

      if (issueKey) {
        oldValue = issue.oldValue(issueKey);
        newValue = issue.fields[issueKey];
      }
      if (field.getValue) {
        newValue = field.getValue(issue);
      }
      if (field.getOldValue) {
        oldValue = field.getOldValue(issue);
      }


      changes.push({
        name: issueKey,
        newValue,
        oldValue
      });
    }
    const response = connection.postSync('/65888504-dcf1-495d-ab65-6efb62bf8289', [], {
      id: issue.id,
      url: issue.url,
      reporter: ctx.issue.reporter.email,
      projectName: issue.project.name || '-',
      state: issue.State.name || '-',
      description: issue.description || '-',
      Assignee: user.email,
      userFullName: user.fullName,
      summary: issue.summary || '-----',
      tags: ctx.issue.tags || [],
      changes,

    });
    workflow.message('Синхронизация изменений в гитлаб....');
  },
  requirements: {
    // TODO: add requirements
  }
});
