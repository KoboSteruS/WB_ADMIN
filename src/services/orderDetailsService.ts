import { WbOrder } from '../types/wildberries';
import { OzonOrder, OzonOrderProduct } from '../types/ozon';
import { OrderItemDetail } from '../components/modals/shared';

/**
 * Интерфейс для элемента skus в заказе Wildberries
 */
interface WbOrderSku {
  name?: string;
  article?: string;
  quantity?: number;
  price?: number;
}

/**
 * Сервис для работы с деталями заказа
 */
class OrderDetailsService {
  /**
   * Преобразует данные заказа Wildberries в формат для отображения в модальном окне
   * @param order Заказ Wildberries
   * @returns Объект с данными для отображения в модальном окне
   */
  transformWbOrderToDetails(order: WbOrder): { 
    orderId: string;
    orderItems: OrderItemDetail[];
    totalQuantity: number;
    totalSum: number;
  } {
    const orderItems: OrderItemDetail[] = [];
    let totalQuantity = 0;
    let totalSum = 0;

    // Если у заказа есть вложенные товары, добавляем их
    if (order.skus && Array.isArray(order.skus) && order.skus.length > 0) {
      order.skus.forEach((sku: any, index) => {
        const item: OrderItemDetail = {
          id: index + 1,
          name: sku.name || order.part_a || order.supplierArticle || 'Нет названия',
          article: sku.article || order.article || order.supplierArticle || 'Нет артикула',
          quantity: sku.quantity || 1,
          price: sku.price || order.price || order.sale_price || 0,
          total: (sku.price || order.price || order.sale_price || 0) * (sku.quantity || 1)
        };
        
        orderItems.push(item);
        totalQuantity += item.quantity;
        totalSum += item.total;
      });
    } else {
      // Если нет вложенных товаров, создаем один товар из основного заказа
      const item: OrderItemDetail = {
        id: 1,
        name: order.part_a || order.supplierArticle || 'Нет названия',
        article: order.article || order.supplierArticle || (order.nm_id ? String(order.nm_id) : 'Нет артикула'),
        quantity: 1,
        price: order.price || order.sale_price || 0,
        total: order.price || order.sale_price || 0
      };
      
      orderItems.push(item);
      totalQuantity = item.quantity;
      totalSum = item.total;
    }

    return {
      orderId: String(order.order_uid || order.order_id || 'б/н'),
      orderItems,
      totalQuantity,
      totalSum
    };
  }

  /**
   * Преобразует данные заказа Ozon в формат для отображения в модальном окне
   * @param order Заказ Ozon
   * @returns Объект с данными для отображения в модальном окне
   */
  transformOzonOrderToDetails(order: OzonOrder): { 
    orderId: string;
    orderItems: OrderItemDetail[];
    totalQuantity: number;
    totalSum: number;
  } {
    const orderItems: OrderItemDetail[] = [];
    let totalQuantity = 0;
    let totalSum = 0;

    // Если у заказа есть вложенные товары, добавляем их
    if (order.products && Array.isArray(order.products) && order.products.length > 0) {
      order.products.forEach((product: OzonOrderProduct, index) => {
        const price = typeof product.price === 'number' ? product.price : 0;
        
        const item: OrderItemDetail = {
          id: index + 1,
          name: product.name || 'Нет названия',
          article: product.sku ? String(product.sku) : product.offer_id || 'Нет артикула',
          quantity: product.quantity || 1,
          price: price,
          total: price * (product.quantity || 1)
        };
        
        orderItems.push(item);
        totalQuantity += item.quantity;
        totalSum += item.total;
      });
    } else {
      // Если нет вложенных товаров, создаем один товар из основного заказа
      const price = typeof order.price === 'number' ? order.price : 
                   typeof order.sale_price === 'number' ? order.sale_price : 0;
      
      const item: OrderItemDetail = {
        id: 1,
        name: order.product_name || order.name || 'Нет названия',
        article: order.offer_id ? String(order.offer_id) : 'Нет артикула',
        quantity: 1,
        price: price,
        total: price
      };
      
      orderItems.push(item);
      totalQuantity = item.quantity;
      totalSum = item.total;
    }

    return {
      orderId: String(order.posting_number || order.order_id || 'б/н'),
      orderItems,
      totalQuantity,
      totalSum
    };
  }
}

export const orderDetailsService = new OrderDetailsService(); 