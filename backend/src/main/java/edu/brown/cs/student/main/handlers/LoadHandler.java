package edu.brown.cs.student.main.handlers;

import com.google.gson.Gson;
import edu.brown.cs.student.main.database.DataProxy;
import spark.Request;
import spark.Response;
import spark.Route;

import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * This class is instantiated when the front end button "load" is pressed by a user.
 * Once instantiated, this will read all the existing
 * tables' names from a SQLite3 file previously read
 * using REPL.
 */
public class LoadHandler implements Route {
  @Override
  public String handle(Request req, Response res) throws SQLException {

    // Read every table name in the sqlite3 file
    List<String> data = DataProxy.getTableNames();
    data = data.stream().distinct().collect(Collectors.toList());
    Gson gson = new Gson();
    return gson.toJson(data);
  }
}
