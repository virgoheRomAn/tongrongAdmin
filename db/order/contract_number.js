var contractNumber = {
    queryByDate:'SELECT * FROM contract_number WHERE date = ? order by id desc',
    insertByBatch:'INSERT INTO contract_number(contract_batch_id, date, number, status) VALUES(?,?,?,?)',
    updateById:'UPDATE contract_number SET number = ? WHERE id = ? ',
};
module.exports = contractNumber;
