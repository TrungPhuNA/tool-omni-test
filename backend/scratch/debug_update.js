const { Request, sequelize } = require('../src/models');

async function testUpdate() {
  const t = await sequelize.transaction();
  try {
    console.log('Testing update for request ID 11');
    const data = {
      "method": "POST",
      "url": "https://pub-be-stag.mp.directsale.vn/api/integration/v1/login-account",
      "headers": [
        {"id": 1777998223500.1057, "key": "X-Port-Type", "value": "PUB", "enabled": true}
      ],
      "body": "{}",
      "params": [],
      "authConfig": {"enabled": false, "loginUrl": "", "loginBody": "", "tokenPath": "data.token"},
      "preScript": "console.log('test pre');",
      "postScript": "console.log('test post');",
      "collection_id": 3,
      "folder_id": 3,
      "name": "Login Test"
    };

    const [affectedRows] = await Request.update(data, {
      where: { id: 11 },
      transaction: t,
      logging: console.log
    });

    console.log('Affected rows:', affectedRows);
    
    const updated = await Request.findByPk(11, { transaction: t });
    console.log('Updated object:', JSON.stringify(updated, null, 2));

    await t.rollback();
  } catch (error) {
    console.error('Test failed:', error);
    await t.rollback();
  }
}

testUpdate();
