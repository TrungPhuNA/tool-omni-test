const { CollectionShare, Collection } = require('./src/models');

async function debug() {
  try {
    const email = 'testat@interspace.vn';
    const shares = await CollectionShare.findAll({
      where: { target_email: email, type: 'internal' }
    });
    console.log('Shares found for', email, ':', JSON.stringify(shares, null, 2));
    
    const allShares = await CollectionShare.findAll();
    console.log('All shares in DB:', JSON.stringify(allShares, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

debug();
