'use strict';
/**
 * Created by j4hangir on 4/10/17.
 */
export default class DB {
  constructor(size = 2000000) {
    this.db = window.openDatabase("db", '', "DB", size);
  }

  drop() {
    console.log("Dropping database")
    this.db.transaction(function (tx) {
      tx.executeSql("DROP TABLE polls");
      tx.executeSql("DROP TABLE options");
      tx.executeSql("DROP TABLE votes");
    });
  }

  polls(callback, visible_only = false) {
    this.db.transaction(function (tx) {
      var query = "";
      if (visible_only)
        query = "SELECT ID, poll, visible FROM polls WHERE visible = 1 ORDER BY oid";
      else
        query = "SELECT ID, poll, visible FROM polls ORDER BY oid"
      tx.executeSql(query, [], function (tx, results) {
        var ret = [];
        for (var i = 0; i < results.rows.length; i++) {
          ret.push(results.rows.item(i));
        }
        if (callback) {
          callback(ret);
        }
      });
    });
  }

  vote_insert(pid, opid) {
    this.db.transaction(function (tx) {
      tx.executeSql("INSERT INTO votes (ID, pid, opid) VALUES (NULL, ?, ?)", [pid, opid]);
    })
  }

  statistics(pid, callback) {
    this.db.transaction(function (tx) {
      var ret = {};
      tx.executeSql("SELECT count(ID) AS total FROM votes WHERE pid = ?", [pid], function (tx, results) {
        ret.count = results.rows.item(0).total;
      });
      tx.executeSql("SELECT ID, option, (SELECT count(ID) FROM votes WHERE pid = ? AND opid=options.ID) AS total FROM options WHERE pid = ? ORDER BY oid", [pid, pid], function (tx, results) {
        ret.votes = [];
        for (var i = 0; i < results.rows.length; i++) {
          var tmp = results.rows.item(i);
          tmp.percentage = parseFloat(tmp.total / ret.count * 100.0).toFixed(2);
          ret.votes.push(tmp);
        }
        var tmp = ret.votes.slice().sort(function (f, s) {
          var a = parseFloat(f.percentage);
          var b = parseFloat(s.percentage);
          return a > b ? -1 : a < b ? 1 : 0;
        });
        for (var i = 0; i < ret.votes.length; i++) {
          for (var j = 0; j < tmp.length; j++)
            if (tmp[j].option == ret.votes[i].option) {
              ret.votes[i].rank = j;
              break;
            }
        }
        if (callback) {
          callback(ret);
        }
      });
    });
  }

  options(pid, callback) {
    this.db.transaction(function (tx) {
      tx.executeSql("SELECT ID, option FROM options WHERE pid = ? ORDER BY oid", [pid], function (tx, results) {
        var ret = [];
        for (var i = 0; i < results.rows.length; i++) {
          ret.push(results.rows.item(i));
        }
        if (callback) {
          callback(ret);
        }
      });
    });
  }

  option_save(opid, text, oid = 0) {
    this.db.transaction(function (tx) {
      tx.executeSql("UPDATE options SET option = ?, oid = ? WHERE ID = ?", [text, oid, opid]);
    });
  }

  option_insert(pid, text, oid = 0) {
    this.db.transaction(function (tx) {
      tx.executeSql("INSERT INTO options (ID, option, pid, oid) VALUES (NULL,?,?,?)", [text, pid, oid]);
    });
  }

  option_delete(opid) {
    this.db.transaction(function (tx) {
      tx.executeSql("DELETE FROM options WHERE ID = ?", [opid]);
      tx.executeSql("DELETE FROM votes WHERE opid = ?", [opid]);
    });
  }

  poll_save(pid, text, oid = 0, visible = 1) {
    this.db.transaction(function (tx) {
      tx.executeSql("UPDATE polls SET poll = ?, oid = ?, visible = ? WHERE ID = ?", [text, oid, visible, pid]);
    });
  }

  poll_insert(text, oid = 0, visible = 1, callback) {
    this.db.transaction(function (tx) {
      tx.executeSql("INSERT INTO polls (ID, poll, oid, visible) VALUES (NULL, ?, ?, ?)", [text, oid, visible], function (tx, result) {
        callback(result.insertId);
      });
    });
  }

  poll_delete(pid) {
    this.db.transaction(function (tx) {
      tx.executeSql("DELETE FROM polls WHERE ID = ?", [pid]);
      tx.executeSql("DELETE FROM options WHERE pid = ?", [pid]);
      tx.executeSql("DELETE FROM votes WHERE pid = ?", [pid]);
    });
  }

  create() {
    this.db.transaction(function (tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS polls (ID INTEGER PRIMARY KEY, poll TEXT UNIQUE, oid INT DEFAULT 0, visible INTEGER DEFAULT 1, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
      tx.executeSql("CREATE TABLE IF NOT EXISTS options (ID INTEGER PRIMARY KEY, option TEXT UNIQUE, pid INT, oid INT DEFAULT 0, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
      tx.executeSql("CREATE INDEX IF NOT EXISTS `idx_pid` ON `options` (`pid` ASC);");
      tx.executeSql("CREATE TABLE IF NOT EXISTS votes (ID INTEGER PRIMARY KEY, pid INT, opid INT, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
      tx.executeSql("CREATE INDEX IF NOT EXISTS `votes_idx_pid` ON `votes` (`pid` ASC);");
      // tx.executeSql("DROP TABLE options", [], function (tx, result) {
      //   console.log("Successfully set up database");
      //   console.log(result);
      // }, function (error) {
      //   console.log("ERROR");
      //   console.log(error);
      // });
    });
  }
};