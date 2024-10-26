import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ResizableBox } from 'react-resizable';
import {
  Box,
  Paper,
  Typography,
  Container,
  TextField,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DragIndicator, Delete } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'react-resizable/css/styles.css';

const workoutTemplates = [
  { id: 'warmup', name: 'Warm Up', effort: 75, distance: 3 },
  { id: 'sprint', name: 'Sprint', effort: 95, distance: 1 },
  { id: 'recovery', name: 'Recovery', effort: 60, distance: 2 },
  { id: 'threshold', name: 'Threshold', effort: 85, distance: 4 },
  { id: 'cooldown', name: 'Cool Down', effort: 65, distance: 2 }
];

const WorkoutBuilder = () => {
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [chartHeight, setChartHeight] = useState(300);

  const getChartData = useCallback(() => {
    let distance = 0;
    return selectedBlocks.map(block => {
      const start = distance;
      distance += Number(block.distance);
      return {
        name: block.name,
        effort: block.effort,
        start,
        end: distance,
        distance: block.distance
      };
    });
  }, [selectedBlocks]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'templates' && destination.droppableId === 'workout') {
      const template = workoutTemplates.find(t => t.id === result.draggableId);
      if (template) {
        const newBlock = {
          ...template,
          id: `${template.id}-${Date.now()}`
        };
        setSelectedBlocks(prev => {
          const blocks = [...prev];
          blocks.splice(destination.index, 0, newBlock);
          return blocks;
        });
      }
    } else if (source.droppableId === 'workout' && destination.droppableId === 'workout') {
      setSelectedBlocks(prev => {
        const blocks = [...prev];
        const [removed] = blocks.splice(source.index, 1);
        blocks.splice(destination.index, 0, removed);
        return blocks;
      });
    }
  };

  const handleDistanceChange = (index, value) => {
    const newDistance = parseFloat(value);
    if (isNaN(newDistance) || newDistance < 0) return;

    setSelectedBlocks(prev => {
      const blocks = [...prev];
      blocks[index] = { ...blocks[index], distance: newDistance };
      return blocks;
    });
  };

  const handleDeleteBlock = (index) => {
    setSelectedBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">{data.name}</Typography>
          <Typography variant="body2">Distance: {data.distance}km</Typography>
          <Typography variant="body2">Effort: {data.effort}%</Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Workout Builder
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workout Blocks
            </Typography>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="templates">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {workoutTemplates.map((template, index) => (
                      <Draggable
                        key={template.id}
                        draggableId={template.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ mb: 1 }}
                          >
                            <CardContent sx={{
                              py: 1,
                              '&:last-child': { pb: 1 },
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <DragIndicator sx={{ mr: 1 }} />
                              <Box>
                                <Typography variant="subtitle2">
                                  {template.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {template.distance}km at {template.effort}% effort
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <ResizableBox
              width={Infinity}
              height={chartHeight}
              minConstraints={[300, 200]}
              maxConstraints={[Infinity, 500]}
              onResize={(e, { size }) => setChartHeight(size.height)}
              handle={
                <Box sx={{
                  height: 10,
                  width: '100%',
                  cursor: 'ns-resize',
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  mb: 2
                }}/>
              }
            >
              <ResponsiveContainer width="100%" height={chartHeight - 10}>
                <BarChart
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, Math.max(...getChartData().map(d => d.end), 5)]}
                    label={{ value: 'Distance (km)', position: 'bottom' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Effort (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="effort" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </ResizableBox>

            <Box sx={{ mt: 3 }}>
              <Droppable droppableId="workout">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {selectedBlocks.map((block, index) => (
                      <Draggable
                        key={block.id}
                        draggableId={block.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{ mb: 1 }}
                          >
                            <CardContent sx={{
                              py: 1,
                              '&:last-child': { pb: 1 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box {...provided.dragHandleProps}>
                                  <DragIndicator sx={{ mr: 1 }} />
                                </Box>
                                <Typography variant="subtitle2">
                                  {block.name}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={block.distance}
                                  onChange={(e) => handleDistanceChange(index, e.target.value)}
                                  InputProps={{
                                    endAdornment: <Typography variant="caption">km</Typography>
                                  }}
                                  sx={{ width: 100 }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteBlock(index)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WorkoutBuilder;
