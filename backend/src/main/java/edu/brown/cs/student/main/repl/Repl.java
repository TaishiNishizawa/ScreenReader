package edu.brown.cs.student.main.repl;

import edu.brown.cs.student.main.commandExecuter.CommandExecuter;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import edu.brown.cs.student.main.database.DataExecutor;

/**
 * This class creates a repl that runs constantly until an EOF is received.
 */
public class Repl {

  private final BufferedReader br;
  private String str;
  private Boolean replStopper;
  private int loopCounter;
  private final HashMap<String, CommandExecuter> commandList;
  /**
   * This class initializes the buffer reader that reads the user inputs.
   */
  public Repl() {
    loopCounter = 1;
    br = new BufferedReader(new InputStreamReader(System.in));
    str = null;
    replStopper = false;
    commandList = new HashMap<>();
    commandList.put("load", new DataExecutor());
  }

  /**
   * This method executes the commands that the user inputs.
   @throws IOException if buffer cannot read the input
   */
  public void run() throws IOException {
    while (!replStopper && ((str = br.readLine()) != null)) {
      String[] command = str.split(" ");
      if (command.length < 2) {
        System.out.println("ERROR: Please enter a valid command (The input length is too short)");
      } else {
        if (commandList.get(command[0]) != null) {
          CommandExecuter appropriateClass = commandList.get(command[0]);
          appropriateClass.executeCommand(command);
        } else {
          System.out.println("ERROR: Given command hasn't been registered yet. "
              + "Try something else.");
        }
      }
      loopCounter++;
    }
  }

  //This is a trivial method for making debugging/testing easier.
  public int constructorTest() {
    return commandList.size();
  }
}
