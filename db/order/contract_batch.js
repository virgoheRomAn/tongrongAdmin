var contractBatch = {
    insert:'INSERT INTO contract_batch(count, status) VALUES(?,?)',
    queryById:'SELECT * FROM contract_batch WHERE id = ? ',
    updateById:'UPDATE contract_batch SET template_type=?, contract_pledge_start_no=?, contract_pledge_end_no=?, contract_loan_start_no=?, contract_loan_end_no=?, file_name = ?, file_path = ? WHERE id = ? ',
    queryPage:'SELECT * FROM contract_batch order by id desc limit ?,?',
    queryCount:'SELECT count(*) as count FROM contract_batch'
};
module.exports = contractBatch;
