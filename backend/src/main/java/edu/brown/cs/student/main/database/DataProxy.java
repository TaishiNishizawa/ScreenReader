package edu.brown.cs.student.main.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class DataProxy {
  private static Connection conn = null;

  /**
   * Connects to a given database and controls sql execution based on database permission.
   * Supports caching database queries and evicts based on query number and data update.
   */
  public DataProxy() {
  }

  /**
   * This method establishes a connection to a specified sqlite3 file.
   *
   * @param filename the database connecting to.
   */
  public void connectDb(String filename)
      throws SQLException, ClassNotFoundException {
    Class.forName("org.sqlite.JDBC");
    String urlToDB = "jdbc:sqlite:" + filename;
    conn = DriverManager.getConnection(urlToDB);
    Statement stat = conn.createStatement();
    stat.executeUpdate("PRAGMA foreign_keys=ON;");
    System.out.println("connected to database");
  }

  /**
   * This method returns a list of all table names in the connected sqlite3 file.
   * @return a list of all table names in the connected sqlite3 file.
   */
  public static List<String> getTableNames() throws SQLException {
    List<String> tableNames = new ArrayList<>();
    String sql = "SELECT * FROM sqlite_master";
    PreparedStatement tableFinder = conn.prepareStatement(sql);
    ResultSet rs = tableFinder.executeQuery();
    while (rs.next()) {
      tableNames.add(rs.getString(3));
    }
    return tableNames;
  }
  /**
   * This method returns the contents of a specified table as an ArrayList of String[].
   *
   * @param tableName name of the table we want to extract information from.
   * @return the contents of a specified table as an ArrayList of Strings.
   */
  public static List<String[]> getTable(String tableName) throws SQLException {
    String sql = "select * from " + tableName;
    PreparedStatement tableFinder = conn.prepareStatement(sql);
    ResultSet result = tableFinder.executeQuery();
    int nCol = result.getMetaData().getColumnCount();
    List<String[]> table = new ArrayList<>();
    while (result.next()) {
      String[] row = new String[nCol];
      for (int iCol = 1; iCol <= nCol; iCol++) {
        Object obj = result.getObject(iCol);
        row[iCol - 1] = (obj == null) ? null : obj.toString();
      }
      table.add(row);
    }
    return table;
  }

  /**
   * This method returns the headers of a specified table as an ArrayList of String[].
   *
   * @param tableName name of the table we want to extract information from.
   * @return the headers of a specified table as an arrayList of strings.
   */
  public static List<String> getTableHeader(String tableName) throws SQLException {
    String sql = "pragma table_info(" + tableName + ")";
    PreparedStatement headerFinder = conn.prepareStatement(sql);
    ResultSet result = headerFinder.executeQuery();
    List<String> header = new ArrayList<>();
    while (result.next()) {
      header.add(result.getString(2));
    }
    return header;
  }
}
