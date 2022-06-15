package edu.brown.cs.student.main.database;

import edu.brown.cs.student.main.commandExecuter.CommandExecuter;

import java.sql.SQLException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class DataExecutor implements CommandExecuter {
  private static final DataProxy MYPROXY = new DataProxy();

  public DataExecutor() {
  }

  /**
   * This method identifies the commands to interact with data proxy.
   *
   * @param args the user command input
   */
  @Override
  public void executeCommand(String[] args) {
    if (Objects.equals(args[0], "load")) {
      if (args[1] == null) {
        System.out.println("ERROR: please enter the name of database after \"load\".");
      } else {
        String filename = args[1];
        initializeDb(filename);
        try {
          List<String> data = DataProxy.getTableNames();
          data = data.stream().distinct().collect(Collectors.toList());
          System.out.println("Backend read following " + data.size() + " files.");
          for (String datum : data) {
            System.out.println(" ・ "  + datum);
          }
        } catch (SQLException e) {
          System.out.println("ERROR: cannot get db query results.");
        }
      }
    } else {
      System.out.println("Use \"load\" command to use our repl.");
    }
  }

  /**
   * This method creates permission and connects to database.
   * The developers are responsible for filling in the permission commands.
   *
   * @param filename    the database to connect to
   */
  public void initializeDb(String filename) {
    // Create connection
    try {
      MYPROXY.connectDb(filename);
    } catch (SQLException | ClassNotFoundException e) {
      System.out.println("ERROR: cannot connect to the database");
    }
  }
}
