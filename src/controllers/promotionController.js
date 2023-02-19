class PromotionController {
  constructor(promotionUsecase) {
    this.promotionUsecase = promotionUsecase;

    this.create = this.create.bind(this);
    this.resend = this.resend.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res, next) {}

  async resend(req, res, next) {}

  async delete(req, res, next) {}
}

module.exports = PromotionController;
