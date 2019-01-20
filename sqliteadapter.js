var validSurvey = function(id) {
  id = parseInt(id);

  if (isNaN(id) || (id >= this.surveys.length)) {
    return false;
  }

  return true;
};


class SqliteDBAdapter {
  constructor(dbFile) {
    this.db = require('better-sqlite3')(dbFile);

    this.db.prepare('CREATE TABLE IF NOT EXISTS surveys (name TEXT PRIMARY KEY, json TEXT)').run();
    this.db.prepare(
      'CREATE TABLE IF NOT EXISTS results (postID TEXT, json TEXT, FOREIGN KEY(postID) ' +
      'REFERENCES surveys(name) ON DELETE CASCADE)').run();

    this.getSurveys((surveys) => {
      this.surveys = surveys;
    });
  }

  addSurvey(name, callback) {
    this.db.prepare('INSERT INTO surveys (name, json) VALUES (?, ?)').run(name, '{}');

    this.getSurveys((surveys) => {
      this.surveys = surveys;
    });

    callback({ 'name': name, json: '{}' });
  }

  getSurvey(surveyID, callback) {
    if (!validSurvey.bind(this)(surveyID)) {
      return callback();
    }

    callback(JSON.parse(this.surveys[surveyID].json));
  }

  storeSurvey(id, json, callback) {
    if (!validSurvey.bind(this)(id)) {
      console.error(`invalid id ${id}`);
      return callback({});
    }

    this.db.prepare("UPDATE surveys SET json = ? WHERE name = ? LIMIT 1").run(json, this.surveys[id].name);
    this.surveys[id].json = json;
    callback(this.surveys[id]);
  }

  getSurveys(callback) {
    const rows = this.db.prepare('SELECT * FROM surveys').all();
    callback(rows);
  }

  deleteSurvey(surveyID, callback) {
    if (!validSurvey.bind(this)(surveyID)) {
      return callback();
    }

    this.db.prepare('DELETE FROM surveys WHERE name=? LIMIT 1').run(this.surveys[surveyID].name);

    this.getSurveys((surveys) => {
      this.surveys = surveys;
    });

    callback();
  }

  postResults(postID, json, callback) {
    if (!validSurvey.bind(this)(postID)) {
      return callback();
    }

    this.db.prepare('INSERT INTO results (postID, json) VALUES(?, ?)').run(this.surveys[postID].name, json);
    callback({ 'postID': postID, 'json': json });
  }

  getResults(postID, callback) {
    if (!validSurvey.bind(this)(postID)) {
      return callback();
    }

    const rows = this.db.prepare('SELECT * FROM results WHERE postID=?').all(this.surveys[postID].name);
    
    var results = (rows || []).map(function(item) {
      return item['json'];
    });

    callback(results);
  }

  changeName(id, name, callback) {
    if (!validSurvey.bind(this)(id)) {
      return callback();
    }

    this.db.prepare("UPDATE surveys SET name = ? WHERE name = ? LIMIT 1").run(name, this.surveys[id].name);
    this.surveys[id].name = name;

    callback(this.surveys[id].name);
  }
}

module.exports = SqliteDBAdapter;
