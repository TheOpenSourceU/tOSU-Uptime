// import { machineId } from 'node-machine-id'; //How do I enable this syntax?

const $npm = {
  machine:        require('node-machine-id'),
  debug:          require('debug')('tOSU-Update:app'),
  EventEmitter:   require('events'),
  Promise:        require('pinkie'),
  rest:           require('rest'),
  config:         require('./config.json') //if must be created with: .codes.stillUp
};

const myEmitter = new $npm.EventEmitter();




// This should tick
$npm.machine.machineId()
    .catch( er => { debug(er); } )
    .then((id) => {
      $npm.debug(id);
        if(id === '34499d873d22918904852fe4431983d5e7a79c1188c51edd087dae716e391648')
          $npm.debug('Machine ID is as expected');
        else
          $npm.debug('ERROR: machine is not as expected!');

        myEmitter.on('trackUptimeEvent', () => {
          $npm.Promise
                .resolve( trackUptime(id) )
                .then( () => {
                    setTimeout(() => {myEmitter.emit('trackUptimeEvent');}, 1000)
                });
        });
        myEmitter.emit('trackUptimeEvent'); //kick the process off.
    });

function trackUptime(myMachineId) {
  if (myMachineId) {
    $npm.debug('trackUptime', myMachineId);
    restCall(myMachineId).catch( (er) => {
      $npm.debug('ERROR: ', er);
      process.exit(1); //1 = error
    } );
    return true;
  } else {
    $npm.debug('id not yet set. Skipping for now');
    return false;
  }
}

function restCall(id) {

  var d = {
    path: `https://tosu-uptime.azurewebsites.net/api/stillUp?code=${$npm.configs.codes.stillUp}`,
    method: 'POST',
    headers: {machineId: id}
  };
  return $npm.rest(d).then( (res) => {
    if(res.status.code === 200) {
      $npm.debug('restCall: success');
      return res; //return to allow access to parent.
    }
    else {
      $npm.debug('restCall: failed');
      throw new Error('Failed due to status code: ' + res.status.code);
    }
  } );
}