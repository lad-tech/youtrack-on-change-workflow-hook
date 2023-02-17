const entities = require('@jetbrains/youtrack-scripting-api/entities');
const http = require('@jetbrains/youtrack-scripting-api/http');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const HOOK_URL = 'https://webhook.site';
const HOOK_PATH = '/65888504-dcf1-495d-ab65-6efb62bf8289';
const HOOK_TOKEN = 'SuperSecretToken';
const tagFilterFn = item => {
  return item !== 'Звезда';
};
const trackedFields = [
  {
    name: 'summary',
    isChanged: issue => issue.summary !== issue.oldValue('summary'),
    getValue: issue => issue.summary || '',
    getOldValue: issue => issue.oldValue('summary') || '',
  },
  {
    name: 'description',
    isChanged: issue => issue.description !== issue.oldValue('description'),
    getValue: issue => issue.description || '',
    getOldValue: issue => issue.oldValue('description') || '',
  },
  {
    name: 'Assignee',
    isChanged: issue => issue.oldValue('Assignee') !== null,
    getOldValue: issue =>
      (issue.oldValue('Assignee') && issue.oldValue('Assignee') !== null && issue.oldValue('Assignee').email) || '',
    getValue: issue => (issue.fields.Assignee && issue.fields.Assignee.email && issue.fields.Assignee.email) || '',
  },
  {
    name: 'State',
    isChanged: issue => issue.oldValue('State') !== null,
    getOldValue: issue => issue.oldValue('State').name,
    getValue: issue => issue.State.name,
  },
  {
    name: 'tags',
    isChanged: issue => issue.tags && issue.tags.added && issue.tags.removed,
    getOldValue: issue => {
      const tags = [];
      (issue.oldValue('tags') || []).forEach(item => {
        console.log('removed', item.name);
        tags.push(item.name);
      });
      return tags.filter(tagFilterFn).sort();
    },
    getValue: issue => {
      const tags = [];
      (issue.tags || []).forEach(item => {
        console.log('added', item.name);
        tags.push(item.name);
      });
      return tags.filter(tagFilterFn).sort();
    },
  },
];

function sendHook(payload) {
  const connection = new http.Connection(HOOK_URL);
  connection.addHeader('Content-Type', 'application/json');
  connection.addHeader('x-youtrack-token', HOOK_TOKEN);
  connection.postSync(HOOK_PATH, [], payload);
}

exports.rule = entities.Issue.onChange({
  title: 'Хук отправки изменений в гитлаб',
  guard: ctx => ctx.issue.isReported,
  runOn: 'change',
  action: ctx => {
    const issue = ctx.issue;
    let user = issue.fields.Assignee;
    if (!user) {
      user = issue.project.leader;
    }

    let changes = [];
    for (let i = 0; i < trackedFields.length; i++) {
      const field = trackedFields[i];
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
        oldValue,
      });
    }
    const tags = [];
    (issue.tags || []).forEach(item => {
      console.log('added', item.name);
      tags.push(item.name);
    });
    sendHook({
      tags: tags.filter(tagFilterFn).sort(),
      id: issue.id,
      url: issue.url,
      reporter: ctx.issue.reporter.email,
      projectName: issue.project.name || '-',
      state: issue.State.name || '-',
      description: issue.description || '-',
      assignee: user.email,
      userFullName: user.fullName,
      summary: issue.summary || '-----',

      changes,
    });

    workflow.message(`Синхронизация изменений  по задаче ${issue.id} в гитлаб....`);
  },
  requirements: {},
});
