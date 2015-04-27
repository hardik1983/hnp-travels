module.exports = function(app) {
  /*
  app.dataSources.hnpDs.automigrate('user', function(err) {
    if (err) throw err;
    console.log('Models created:');
  });
  
  app.dataSources.hnpDs.automigrate('driver', function(err) {
    if (err) throw err;
    console.log('Models created:');
  });
  app.dataSources.hnpDs.automigrate('customer', function(err) {
    if (err) throw err;
    console.log('Models created:');
  });
  app.dataSources.hnpDs.automigrate('car', function(err) {
    if (err) throw err;
    console.log('Models created:');
  });
  app.dataSources.hnpDs.automigrate('event', function(err) {
    if (err) throw err;
    console.log('Models created:');
  });
  
  function modifyResponse(ctx, model, next) {
    ctx.res.set('Access-Control-Expose-Headers', 'Location');
  }

  app.models.user.afterRemote('**', modifyResponse);
  app.models.driver.afterRemote('**', modifyResponse);
  app.models.customer.afterRemote('**', modifyResponse);
  app.models.car.afterRemote('**', modifyResponse);
  app.models.event.afterRemote('**', modifyResponse);
 
  
  var User = app.models.user;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  
  User.create([
    {username: 'John', email: 'john@doe.com', password: 'opensesame', firstName: 'John', lastName: 'Smith', mobile: 9898298982 },
    {username: 'Jane', email: 'jane@doe.com', password: 'opensesame', firstName: 'Jane', lastName: 'Smith', mobile: 9898298982 },
    {username: 'Bob', email: 'bob@projects.com', password: 'opensesame', firstName: 'Bob', lastName: 'Smith', mobile: 9898298982 }
  ], function(err, users) {
    if (err) throw err;

    console.log('Created users:', users);

    //create the admin role
    Role.create({
      name: 'admin'
    }, function(err, role) {
      if (err) throw err;

      console.log('Created role:', role);

      //make bob an admin
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[2].id
      }, function(err, principal) {
        if (err) throw err;

        console.log('Created principal:', principal);
      });
    });
  });         */

  
  
};