package edu.brown.cs.student.main.commandExecuter;

/**
 * This interface executes the given command.
 */
public interface CommandExecuter {

  /**
   * This method executes the given command.
   * @param args command strings
   */
  void executeCommand(String[] args);

}
