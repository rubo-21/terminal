$(function() {
  var output = document.getElementById('output'),
      button = document.getElementById('button'),
      worker = new Worker('lib/empythoned/worker.js'),
      loaded = false,
      handler = function (e) {
        if (!loaded) {
          loaded = true;
          button.value = "Execute";
          editor.setReadOnly(false);
          button.disabled = false;
          return;
        }
        // output.value += e.data;
        jqconsole.Write(e.data);
      };

  /***** Empythoned  *****/
  worker.addEventListener('message', handler, false);

  button.onclick = function() {
    worker.postMessage(editor.getValue());
  };

  /***** ACE Editor *****/
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/python");
  editor.setReadOnly(true);

  /***** jqconsole  *****/

  // Creating the console.
  var header = 'Welcome to JQConsole!\n' +
               'Use jqconsole.Write() to write and ' +
               'jqconsole.Input() to read.\n';
  window.jqconsole = $('#console').jqconsole(header, 'JS> ');

  // Abort prompt on Ctrl+Z.
  jqconsole.RegisterShortcut('Z', function() {
    jqconsole.AbortPrompt();
    handler();
  });
  // Move to line start Ctrl+A.
  jqconsole.RegisterShortcut('A', function() {
    jqconsole.MoveToStart();
    handler();
  });
  // Move to line end Ctrl+E.
  jqconsole.RegisterShortcut('E', function() {
    jqconsole.MoveToEnd();
    handler();
  });
  jqconsole.RegisterMatching('{', '}', 'brace');
  jqconsole.RegisterMatching('(', ')', 'paran');
  jqconsole.RegisterMatching('[', ']', 'bracket');
  // Handle a command.
  var handler = function(command) {
    if (command) {
      try {
        jqconsole.Write('==> ' + window.eval(command) + '\n');
      } catch (e) {
        jqconsole.Write('ERROR: ' + e.message + '\n');
      }
    }
    jqconsole.Prompt(true, handler, function(command) {
      // Continue line if can't compile the command.
      try {
        Function(command);
      } catch (e) {
        if (/[\[\{\(]$/.test(command)) {
          return 1;
        } else {
          return 0;
        }
      }
      return false;
    });
  };

  // Initiate the first prompt.
  handler();
});