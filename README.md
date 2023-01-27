# Скрипт рабочего процесса youtrack отправки информации об изменениях в задаче

### Настройка

* Добавить скрипт в рабочие процессы ютрека 
* Поменять переменные хоста и пути
* Поменять токен


<summary>Пример хука</summary>

```json 
{
  "id": "MyProject-45",
  "url": "https://youtrack.qqqq.ru/issue/MyProject-45",
  "reporter": "petya@qq.ru",
  "projectName": "DevOps",
  "state": "To Do",
  "description": "Test description",
  "Assignee": "vasya@test.ru",
  "userFullName": "Vasya Petrov",
  "summary": "TEST NAME",
  "changes": [
    {
      "name": "State",
      "newValue": "To Do",
      "oldValue": "Reopened"
    },
    {
      "name": "summary",
      "newValue": "TEST NAME",
      "oldValue": "Тест 112"
    },
    {
      "name": "tags",
      "newValue": [
        "Android",
        "Звезда"
      ],
      "oldValue": [
        "Android",
        "Звезда"
      ]
    }
  ]
}



```

