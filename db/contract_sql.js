var contractSql = {
    insert:'INSERT INTO contract(customer_name,idcard_no,address,phone,loan_amount,periods, status) VALUES(?,?,?,?,?,?,?)',
    updateById:'UPDATE contract SET contract_no = ?, file_name = ?, file_path = ? WHERE id = ? ',
    updateStatusById:'UPDATE contract SET status = ? WHERE id = ? ',
    queryById:'SELECT * FROM contract WHERE id = ? ',
    queryPage:'SELECT * FROM contract order by id desc limit ?,?',
    queryCount:'SELECT count(*) as count FROM contract'
};
module.exports = contractSql;
