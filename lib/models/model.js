class Model {
    constructor(schema) {
        this.schema = schema;
    }

    async create(data) {
        let record = new this.schema(data);
        return await record.save();
    }

    async read(_id) {
        let record = await this.schema.findOne({ _id }).populate('roleObj');
        return record;
    }

    async readByQuery(query) {
        let records = await this.schema.find(query);
        return records;
    }

    async update(_id, data) {
        let updateInfo = await this.schema.updateOne({ _id }, data);
        if (updateInfo && updateInfo.nModified === 1) {
            let record = await this.read(_id);
            return record;
        }

        return false;
    }

    async delete(_id) {
        let deleteInfo = await this.schema.deleteOne({ _id });

        if (deleteInfo.deletedCount === 1) return true;

        return false;
    }

    verifyToken(token) {
        return this.schema.verifyToken(token);
    }
}

module.exports = Model;
