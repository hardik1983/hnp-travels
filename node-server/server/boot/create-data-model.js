module.exports = function(app) {
/*  app.dataSources.hnpDs.automigrate('user', function(err) {
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
  /*
  function modifyResponse(ctx, model, next) {
    ctx.res.set('Access-Control-Expose-Headers', 'Location');
  }

  app.models.user.afterRemote('**', modifyResponse);
  app.models.driver.afterRemote('**', modifyResponse);
  app.models.customer.afterRemote('**', modifyResponse);
  app.models.car.afterRemote('**', modifyResponse);
  app.models.event.afterRemote('**', modifyResponse);
  */
};