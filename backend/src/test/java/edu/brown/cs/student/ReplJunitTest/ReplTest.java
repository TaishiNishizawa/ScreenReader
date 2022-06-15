package edu.brown.cs.student.ReplJunitTest;


import edu.brown.cs.student.main.repl.Repl;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static org.junit.Assert.assertEquals;

public class ReplTest {

  @Rule
  public ExpectedException expectedException = ExpectedException.none();

  @Test
  public void constructorTest() {
    Repl myRep = new Repl();
    assertEquals(myRep.constructorTest(), 1);
  }

}
