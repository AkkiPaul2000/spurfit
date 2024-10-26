import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Updated workout templates based on provided data
const workoutTemplates = [
  {
    id: 'warmup',
    name: 'Warmup',
    description: '75% effort warmup for 3km',
    blocks: [{ effort: 75, duration: 3 }]
  },
  {
    id: 'intense-run',
    name: 'Intense Run',
    description: '120% effort for 3km',
    blocks: [{ effort: 120, duration: 3 }]
  },
  {
    id: 'walk',
    name: 'Walk',
    description: '50% effort for 3km walk',
    blocks: [{ effort: 50, duration: 3 }]
  },
  {
    id: 'active',
    name: 'Active Workout',
    description: '75% effort for 1.5km & 50% effort for 1.5km',
    blocks: [{ effort: 75, duration: 1.5 }, { effort: 50, duration: 1.5 }]
  },
  {
    id: 'steady-increase',
    name: 'Steady Increase',
    description: 'Progressive effort from 50% to 80% over 4km',
    blocks: [
      { effort: 50, duration: 1 },
      { effort: 60, duration: 1 },
      { effort: 70, duration: 1 },
      { effort: 80, duration: 1 }
    ]
  },
  {
    id: 'steady-calm-down',
    name: 'Calm Down',
    description: 'Decreasing effort from 80% to 50% over 4km',
    blocks: [
      { effort: 80, duration: 1 },
      { effort: 70, duration: 1 },
      { effort: 60, duration: 1 },
      { effort: 50, duration: 1 }
    ]
  }
];

const App = () => {
  const [droppedWorkouts, setDroppedWorkouts] = useState([]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (destination.droppableId === 'chart' && source.droppableId === 'workoutList') {
      const workout = workoutTemplates[source.index];
      setDroppedWorkouts(prev => [...prev, ...workout.blocks]);
    }
  };

  const handleDistanceChange = (index, newDistance) => {
    setDroppedWorkouts(droppedWorkouts.map((block, i) =>
      i === index ? { ...block, distance: newDistance } : block
    ));
  };

  const cumulativeDistance = droppedWorkouts.reduce((acc, block) => {
    const lastDistance = acc.length > 0 ? acc[acc.length - 1].x : 0;
    acc.push({ x: lastDistance + (block.distance || block.duration), y: block.effort });
    return acc;
  }, []);

  return (
    <>
    <Box display="flex" p={2} gap={4} justifyContent="center">
      <DragDropContext onDragEnd={onDragEnd}>

        {/* Left Side: Workout Templates with Bar Charts for Visualization */}
        <Droppable droppableId="workoutList">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ width: '50%' }}>
              <Typography variant="h6" gutterBottom align="center">Workout Templates</Typography>
              <Grid container spacing={2}>
                {workoutTemplates.map((workout, index) => (
                  <Draggable key={workout.id} draggableId={workout.id} index={index}>
                    {(provided) => (
                      <Grid item xs={12} sm={6} md={4}>
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          bgcolor="#e0f7fa"
                          p={2}
                          borderRadius={1}
                        >
                          <Typography variant="subtitle2">{workout.name}</Typography>
                          {/* <Typography variant="body2" color="textSecondary">{workout.description}</Typography> */}
                          <ResponsiveContainer width="100%" height={80}>
                            <BarChart data={workout.blocks.map(block => ({
                                effort: block.effort,
                                distance: block.duration
                              }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="distance" unit="km" hide />
                              <YAxis dataKey="effort" unit="%" hide />
                              <Tooltip />
                              <Bar dataKey="effort" fill="#2196f3" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Grid>
            </Box>
          )}
        </Droppable>

        {/* Right Side: Dropped Workouts Cumulative Bar Chart */}
        <Droppable droppableId="chart">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom align="center">Effort vs Distance Chart</Typography>

              {/* Bar Chart for Dropped Workouts */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cumulativeDistance} barCategoryGap={0}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Effort (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="y" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>

              {/* Editable Distance Panel */}
              <Box mt={4} width="100%">
                <Typography variant="h6" align="center">Adjust Distances</Typography>
                {droppedWorkouts.map((block, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2} mt={1}>
                    <Typography>{`Block ${index + 1}`}</Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={block.distance || block.duration}
                      onChange={(e) => handleDistanceChange(index, Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0, step: 0.1 } }} // Allows starting from 0 with any decimal input
                    />
                    <Typography>km</Typography>
                  </Box>
                ))}
              </Box>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
    </>
  );
}

export default App;
