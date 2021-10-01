module.exports = function(robot) {
  return robot.router.get('/health', function(req, res) {
    return res.status(200).end();
  });
};
