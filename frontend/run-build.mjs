import { exec } from 'child_process';
exec('npm run build', (err, stdout, stderr) => {
  import('fs').then(fs => {
    fs.writeFileSync('build-output.txt', stdout + '\n' + stderr);
  });
});
