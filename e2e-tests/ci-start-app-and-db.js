const cp = require('child_process');
const readline = require('linebyline');

function spawn(name, cmd, args, done) {
  try {
    const spawnOptions = {
      detached: true,
    };
    const proc = cp.spawn(cmd, args, spawnOptions);
  
    // We close stdin stream on the new process because otherwise the start-app
    // process hangs.
    // See https://github.com/wasp-lang/wasp/pull/1218#issuecomment-1599098272.
    proc.stdin.destroy();
  
    readline(proc.stdout).on('line', (data) => {
      console.log(`\x1b[0m\x1b[33m[${name}][out]\x1b[0m ${data}`);
    });
    readline(proc.stderr).on('line', (data) => {
      console.log(`\x1b[0m\x1b[33m[${name}][err]\x1b[0m ${data}`);
    });
    proc.on('exit', done);
    
  } catch (error) {
    console.error(error)
  }
}

// Exit if either child fails
const cb = (code) => {
  if (code !== 0) {
    process.exit(code);
  }
};
spawn('app', 'npm', ['run', 'e2e:start-app'], cb);
spawn('db', 'npm', ['run', 'e2e:start-db'], cb);
spawn('prisma', 'npm', ['run', 'e2e:setup-prisma'], cb);
