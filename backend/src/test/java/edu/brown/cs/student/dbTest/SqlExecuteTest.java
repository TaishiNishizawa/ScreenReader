package edu.brown.cs.student.dbTest;

import edu.brown.cs.student.main.database.DataProxy;
import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class SqlExecuteTest {

  private final int expected = 12;
  @Test
  public void connectTest() {
    DataProxy myProxy = new DataProxy();
    try {
      myProxy.connectDb("../data/horoscopes.sqlite3");
    } catch (SQLException | ClassNotFoundException e) {
      System.out.println("failed");
    }
    assertNotNull(myProxy);
  }

  @Test
  public void getTableNamesTest() {
    DataProxy myProxy = new DataProxy();
    List<String> tester = new ArrayList<>();
    try {
      myProxy.connectDb("../data/horoscopes.sqlite3");
      tester = DataProxy.getTableNames();
    } catch (SQLException | ClassNotFoundException e) {
      System.out.println("failed");
    }
    assertEquals(tester.size(), 4);
  }

  @Test
  public void getTableNameTestWrong() {
    DataProxy myProxy = new DataProxy();
    List<String> tester = new ArrayList<>();
    try {
      myProxy.connectDb("../data/horos3");
      tester = DataProxy.getTableNames();
    } catch (SQLException | ClassNotFoundException e) {
      System.out.println("failed");
    }
    assertEquals(tester.size(), 0);
  }
  @Test
  public void getTableContentTest() {
    DataProxy myProxy = new DataProxy();
    List<String[]> tester = new ArrayList<>();
    try {
      myProxy.connectDb("../data/horoscopes.sqlite3");
      tester = DataProxy.getTable("horoscopes");
    } catch (SQLException | ClassNotFoundException e) {
      System.out.println("failed");
    }
    System.out.println(tester.size());
    assertEquals(tester.size(), expected);
  }
}
