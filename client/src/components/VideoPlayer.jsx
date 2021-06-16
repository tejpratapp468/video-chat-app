import React, { useContext } from 'react';
import { Grid, Typography, Paper, makeStyles } from '@material-ui/core';

import { SocketContext } from '../Context';
// styles
const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px', // width on mobile devices
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    }, // for mobile devices it is all in one column
  },
  paper: {
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);
  const classes = useStyles();

  return (
    <Grid container className={classes.gridContainer}> {/* conditionally showing user and client's screen */}
      {stream && ( // if there is stream only then show user's screen
        <Paper className={classes.paper}> {/* our own video */}
          <Grid item xs={12} md={6}> {/* full width on smaller devices and half width on larger devices */}
            <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography> {/* use name or 'Name */}
            <video playsInline muted ref={myVideo} autoPlay className={classes.video} /> {/* mute our video notof other so other person's voice can be heard, also ref is main connection b/w stream & video component */}
          </Grid>
        </Paper>
      )}
      {callAccepted && !callEnded && ( // if !callEnded && call is  Accpeted only then show other user's screen
        <Paper className={classes.paper}> {/* other user's video */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
            <video playsInline ref={userVideo} autoPlay className={classes.video} /> {/* not mutingother so other person's voice can be heard */}
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
//  <Grid item xs={12} md={6}>  on smaller screen occupy full width else half width
