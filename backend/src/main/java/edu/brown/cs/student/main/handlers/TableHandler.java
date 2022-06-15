package edu.brown.cs.student.main.handlers;

import com.google.gson.Gson;
import edu.brown.cs.student.main.database.DataProxy;
import spark.Request;
import spark.Response;
import spark.Route;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * This class is instantiated when the front end options are changed.
 * Once instantiated, this will read the header
 * and all contents of the table specified by api parameter.
 */
public class TableHandler implements Route {
  @Override
  public String handle(Request req, Response res) throws SQLException {

    // Extract query parameter to store which table front end is requesting to backend
    String tableName = req.queryParams("tableName");

    // Get the first row (header)
    List<String> header = DataProxy.getTableHeader(tableName);
    header = header.stream().distinct().collect(Collectors.toList());

    //Get the contents of the table
    List<String[]> data = DataProxy.getTable(tableName);
    data = data.stream().distinct().collect(Collectors.toList());

    // Combine header and contents
    List<HashMap<String, String>> ret = new ArrayList<>();
    for (int i = 0; i < data.size(); i++) {
      HashMap<String, String> toAdd = new HashMap<>();
      for (int j = 0; j < header.size(); j++) {
        toAdd.put(header.get(j), data.get(i)[j]);
      }
      ret.add(toAdd);
    }

    Gson gson = new Gson();
    return gson.toJson(ret);
  }
}
