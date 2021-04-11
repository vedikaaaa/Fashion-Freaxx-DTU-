const ussers = [];

// Join usser to chat
function usserJoin(id, ussername, room) {
  const usser = { id, ussername, room };

  ussers.push(usser);

  return usser;
}

// Get current usser
function getCurrentusser(id) {
  return ussers.find(usser => usser.id === id);
}

// usser leaves chat
function usserLeave(id) {
  const index = ussers.findIndex(usser => usser.id === id);

  if (index !== -1) {
    return ussers.splice(index, 1)[0];
  }
}

// Get room ussers
function getRoomussers(room) {
  return ussers.filter(usser => usser.room === room);
}

module.exports = {
  usserJoin,
  getCurrentusser,
  usserLeave,
  getRoomussers
};
