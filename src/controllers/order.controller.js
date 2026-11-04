const prisma = require("../lib/prisma");

async function createOrder(req, res) {
  try {
    const uid = req.user?.uid;
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!uid) {
      return res.status(401).json({ error: "Bạn chưa đăng nhập." });
    }

    if (!items.length) {
      return res
        .status(400)
        .json({ error: "Đơn hàng phải có ít nhất 1 sản phẩm." });
    }

    const orderItems = [];

    // Kiểm tra tính hợp lệ và tồn kho của từng sản phẩm
    for (const item of items) {
      const pid = Number(item?.pid);
      const qty = Number(item?.qty || 1);

      if (!pid || qty <= 0) {
        return res
          .status(400)
          .json({ error: "Thông tin sản phẩm hoặc số lượng không hợp lệ." });
      }

      const product = await prisma.product.findUnique({ where: { pid } });
      if (!product) {
        return res
          .status(404)
          .json({ error: `Không tìm thấy sản phẩm có pid=${pid}` });
      }

      if (product.quantity < qty) {
        return res
          .status(400)
          .json({ error: `Sản phẩm ${product.pname} không đủ hàng.` });
      }

      orderItems.push({
        pid: product.pid,
        pname: product.pname,
        qty,
        unit_price: product.price,
      });
    }

    // Thực hiện Transaction: Order -> OrderDetail -> Trừ kho -> Tạo Shipment
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo Order (createat mặc định lấy thời gian hiện hành)
      const newOrder = await tx.order.create({
        data: {
          uid,
          createat: new Date(),
        },
      });

      // 2. Tạo chi tiết đơn hàng (OrderDetail)
      await tx.orderDetail.createMany({
        data: orderItems.map((item) => ({
          oid: newOrder.oid,
          pid: item.pid,
          qty: item.qty,
          unit_price: item.unit_price,
        })),
      });

      // 3. Cập nhật trừ số lượng kho Product
      for (const item of orderItems) {
        await tx.product.update({
          where: { pid: item.pid },
          data: { quantity: { decrement: item.qty } },
        });
      }

      // 4. Tạo bản ghi Shipment tự động sau khi đặt hàng thành công
      const newShipment = await tx.shipment.create({
        data: {
          oid: newOrder.oid,
          status: "PENDING", // Khởi tạo trạng thái giao hàng
        },
      });

      return {
        order: newOrder,
        shipment: newShipment,
      };
    });

    // Trả về đầy đủ thông tin theo yêu cầu đề bài
    res.status(201).json({
      message: "Đặt hàng thành công và đã chuyển sang shipment!",
      order: result.order,
      orderDetails: orderItems,
      shipment: result.shipment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Bạn chưa đăng nhập." });
    }

    const orders = await prisma.order.findMany({
      where: { uid },
      include: {
        orderDetails: {
          include: {
            product: true,
          },
        },
        shipments: true,
      },
      orderBy: { createat: "desc" },
    });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createOrder, getMyOrders };
