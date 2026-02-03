import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Legacy products data from products.sql
const legacyProducts = [
  {
    id: 70,
    name: 'LFZ&LOY 3CHA 136 V.1',
    price: 160.00,
    brandname: 'LFZ&LOY 3CHA 136 V.1',
    image: 'https://i.imgur.com/EUSTTBZ.png',
    created: '2023-09-10 03:45:15',
    counts: 1950,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/r9club-support/r9club-store-lfzloy-3cha-136-v1',
    link_download: 'https://drive.google.com/file/d/1sXXHXVv9sYp-GAixcB_EG3BM6unufTNa/view?usp=sharing',
  },
  {
    id: 72,
    name: 'DJLOY SHADOW V.1 136',
    price: 160.00,
    brandname: 'DJLOY SHADOW V.1 136',
    image: 'https://i.imgur.com/VG0MOak.png',
    created: '2023-09-10 04:44:00',
    counts: 1742,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/r9club-support/djloy-shadow-v1-136',
    link_download: 'https://drive.google.com/file/d/1mcEcgEpv_sRSb-Rm0_VStrat-ipqXLDn/view?usp=sharing',
  },
  {
    id: 77,
    name: 'DJLOY RUMVONG 110 BPM',
    price: 160.00,
    brandname: 'DJLOY RUMVONG 110 BPM',
    image: 'https://i.imgur.com/qdoZ3RR.png',
    created: '2023-09-17 13:13:32',
    counts: 961,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/r9club-support/r9club-store-djloy-rumvong-110-bpm',
    link_download: 'https://drive.google.com/file/d/1clARafjOxg0Z8N72w3Uvsx6iDZXiWQ6J/view?usp=sharing',
  },
  {
    id: 78,
    name: 'DJLOY HIPHOP 116 V.1',
    price: 160.00,
    brandname: 'DJLOY HIPHOP 116 V.1',
    image: 'https://i.imgur.com/6mN1EhV.png',
    created: '2023-09-17 13:15:57',
    counts: 1068,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/r9club-support/djloy-hiphop-116-v1',
    link_download: 'https://drive.google.com/file/d/1bh1MBpHWEYF-hLx2bvLL9YyireEs_6va/view?usp=sharing',
  },
  {
    id: 80,
    name: 'LFZ&LOY 3CHA 136 V.2',
    price: 160.00,
    brandname: 'LFZ&LOY 3CHA 136 V.2',
    image: 'https://i.imgur.com/3iUvgFL.png',
    created: '2023-09-17 14:12:49',
    counts: 1523,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/r9club-support/lfzloy-2',
    link_download: 'https://drive.google.com/file/d/1DpT0K3SptYnhQcMv3w2DNrY4pv7C6Kip/view?usp=sharing',
  },
  {
    id: 81,
    name: 'PRMiXZ XLP PATTiNUM 146',
    price: 150.00,
    brandname: 'PRMiXZ XLP PATTiNUM 146 หากซื้อแล้วห้ามแจกต่อหรือขายต่อใดๆทั้งสิ้น!!!',
    image: 'https://i.imgur.com/dulnYqF.png',
    created: '2023-10-04 17:47:29',
    counts: 1375,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/djpeeremix/prmixz-test-loop-najaaaaaa-146-pattinum',
    link_download: 'https://drive.google.com/file/d/1dU0wYOMdDlxRwpIyD4LebhrD4zrUdyry/view?usp=sharing',
  },
  {
    id: 82,
    name: 'PRMiXZ คนจนมีสิทธ์ไหมคะ remix ยกล้อ',
    price: 100.00,
    brandname: 'PRMiXZ คนจนมีสิทธ์ไหมคะ remix ยกล้อ',
    image: 'https://i.imgur.com/YAWTKYW.png',
    created: '2023-10-04 18:28:49',
    counts: 980,
    products_status: 2,
    product_categorie_id: 1,
    link_music: 'https://soundcloud.com/djpeeremix',
    link_download: 'https://drive.google.com/file/d/1GmdmeHSQhGuYbs0AiQpciMdV6uhp6Qgq/view',
  },
  {
    id: 83,
    name: 'HALLOWEEN - SET.2K23 - 150BPM [ 320KBPS ] - [ NOPREMIX_X ] - V.1',
    price: 240.00,
    brandname: 'HALLOWEEN - SET.2K23 - 150BPM [ 320KBPS ] - [ NOPREMIX_X ] - V.1\r\n10 TRACK - 300 BAHT',
    image: 'https://i.imgur.com/U2NasLf.png',
    created: '2023-10-31 01:47:28',
    counts: 1367,
    products_status: 1,
    product_categorie_id: 1,
    link_music: 'https://soundcloud.com/r9club-support/demo-halloween-set2k23-150bpm-320kbps-nopremix_x-v1',
    link_download: 'https://drive.google.com/file/d/1l8Rl60OVPZgaspuETCg4y5NeYuIQGf3E/view?usp=sharing',
  },
  {
    id: 85,
    name: '#PRMiXZ BeakMix PART.8',
    price: 200.00,
    brandname: '#PRMiXZ BeakMix PART.8 หากซื้อแล้วห้ามแจกต่อหรือขายต่อใดๆทั้งสิ้น!!!',
    image: 'https://i.imgur.com/sNqFGJh.png',
    created: '2023-12-09 06:15:41',
    counts: 729,
    products_status: 1,
    product_categorie_id: 1,
    link_music: 'https://www.facebook.com/watcharapong.prasong.3/posts/1522528358601914',
    link_download: 'https://drive.google.com/file/d/1Pd68T5vDK3F-edVObXq42X64CIwRitzW/view?usp=sharing',
  },
  {
    id: 86,
    name: '#PRMiXz 2K24 PART.1',
    price: 280.00,
    brandname: '#PRMiXZ 2K24 PART.1 หากซื้อแล้วห้ามแจกต่อหรือขายต่อใดๆทั้งสิ้น!!!',
    image: 'https://i.imgur.com/Yurz9Kh.png',
    created: '2024-01-13 12:08:42',
    counts: 526,
    products_status: 2,
    product_categorie_id: 1,
    link_music: 'https://www.facebook.com/watcharapong.prasong.3/posts/1540262490161834',
    link_download: 'https://drive.google.com/file/d/1ml8pUR47sOqfH6tN28MCSmEbINUI5tsZ/view?usp=sharing',
  },
  {
    id: 93,
    name: '#PRMiXz SPEED 2K24 PART.1',
    price: 250.00,
    brandname: '#PRMiXz SPEED 2K24 PART.1 หากซื้อแล้วห้ามแจกต่อหรือขายต่อใดๆทั้งสิ้น!!!',
    image: 'https://i.imgur.com/YdGsjKn.png',
    created: '2024-02-08 12:35:27',
    counts: 626,
    products_status: 2,
    product_categorie_id: 1,
    link_music: 'https://www.facebook.com/watcharapong.prasong.3/posts/1548362646018485',
    link_download: 'https://drive.google.com/file/d/13FvFT_plLegDnP9O2_gtppfFk_9iPF8V/view?usp=drive_link',
  },
  {
    id: 94,
    name: 'PROJECT DJLOY REMIX FEW 136 | 2022',
    price: 400.00,
    brandname: 'DAW - FL STUDIO 21.1.1 +\r\n\r\nPlugin VST \r\n1.Ozone 9\r\n2.FabFilter\r\n3.Rare\r\n\r\nสิ่งที่จะได้▶️ ซาวด์เพลงทั้งโปรเจค + ลูปเพลง',
    image: 'https://i.imgur.com/Y3UwAQp.png',
    created: '2024-04-18 00:59:53',
    counts: 1755,
    products_status: 2,
    product_categorie_id: 30,
    link_music: 'https://youtu.be/C2N_joh3QyU?si=0C2do-GrwG99fhOY',
    link_download: 'https://drive.google.com/file/d/1ITr7bCL0WMZYjj4yLbehWMhmiV9SbFaQ/view?usp=sharing',
  },
  {
    id: 95,
    name: 'MIXER-TOOL | BY DJLOYREMIX - สำหรับทำเพลงแดนซ์ (FREE)',
    price: 0.00,
    brandname: 'MIXER-TOOL | BY DJLOYREMIX - สำหรับทำเพลงแดนซ์',
    image: 'https://i.imgur.com/lkZkTsx.png',
    created: '2024-06-30 05:02:19',
    counts: 1346,
    products_status: 2,
    product_categorie_id: 30,
    link_music: '#',
    link_download: '/credit',
  },
  {
    id: 96,
    name: 'DJLOY HIPHOP 116 V.2 | 2024',
    price: 160.00,
    brandname: 'DJLOY HIPHOP 116 V.2 | 2024\r\n#สนับสนุนเจ้าของลูปเท่านั้น',
    image: 'https://i.imgur.com/vG7BL1l.png',
    created: '2024-07-03 21:21:46',
    counts: 1231,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://youtu.be/wdjFM8twlEY?si=BplHaYezld0BlnZJ',
    link_download: 'https://drive.google.com/file/d/13U_oUoibl_6czZ20Tm5aguXM5qo6UDIj/view?usp=sharing',
  },
  {
    id: 97,
    name: 'DOMHEE - 3CHA 136 | [ NOPREMIX ]',
    price: 160.00,
    brandname: 'DOMHEE - 3CHA 136 | [ NOPREMIX ]',
    image: 'https://i.imgur.com/QZHZBeX.jpeg',
    created: '2024-08-03 21:17:21',
    counts: 1125,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://soundcloud.com/r9club-support/domhee-3cha-nopremix',
    link_download: 'https://drive.google.com/file/d/14u8J4_UEyQxJ1DQ3J1QNWkmzD3oBBW0K/view?usp=sharing',
  },
  {
    id: 98,
    name: 'R9CLUB | FUNKY NIGHT - เพลงอินโดสไตล์',
    price: 200.00,
    brandname: 'R9CLUB | FUNKY NIGHT - แพ็คเพลงอินโดสไตล์',
    image: 'https://i.imgur.com/zoESmFO.jpeg',
    created: '2024-08-26 01:21:53',
    counts: 355,
    products_status: 2,
    product_categorie_id: 1,
    link_music: 'https://youtu.be/dUtIm5tfAhU?si=1Wr1RhKsk2ejl_zp',
    link_download: 'https://drive.google.com/file/d/1japv8wCjUxGetqUzGWzRkK5h7OUfrXyB/view?usp=sharing',
  },
  {
    id: 99,
    name: 'ปกฟอนต์เพลงแดนซ์ ต้อนรับสงกราต์ | NOPREMIX',
    price: 100.00,
    brandname: 'NOPREMIX | ฟอนต์ตัวหนังสือ ต้อนรับสงกราต์',
    image: 'https://i.imgur.com/9cFgXe7.jpeg',
    created: '2025-02-25 17:07:04',
    counts: 441,
    products_status: 2,
    product_categorie_id: 31,
    link_music: '#',
    link_download: 'https://drive.google.com/file/d/1ZLBfNWVwT3BYPLGOsYEIO1e0mECwJj_A/view?usp=sharing',
  },
  {
    id: 100,
    name: 'DJLOY (136 - NEWTUNE) LIMITED 2024',
    price: 300.00,
    brandname: 'DJLOY (136 - NEWTUNE) LIMITED + มีของแถมสำหรับ Preset',
    image: 'https://i.imgur.com/z9Ne8jg.png',
    created: '2025-03-19 02:23:21',
    counts: 965,
    products_status: 2,
    product_categorie_id: 16,
    link_music: 'https://youtu.be/dUtIm5tfAhU?si=YSPXGJPkvge1OJTj',
    link_download: 'https://drive.google.com/file/d/17OXB0OTSic6hqpml_eN80bnaN7s4D-M4/view?usp=sharing',
  },
  {
    id: 101,
    name: '[ NOPREMIX_X ] 150BPM 2025 VOL.1',
    price: 400.00,
    brandname: '[ NOPREMIX_X ] 150BPM 2025 VOL.1 6TRACK',
    image: 'https://i.imgur.com/U2NasLf.png',
    created: '2025-06-23 20:54:01',
    counts: 481,
    products_status: 1,
    product_categorie_id: 1,
    link_music: 'https://soundcloud.com/r9club-support/demo-150-nopremix_x-2025-vol-1',
    link_download: 'https://drive.google.com/file/d/1YLyc9HRKuF14AMOd3A5lKAd-2HDxFV1M/view?usp=sharing',
  },
  {
    id: 102,
    name: 'PROJECT FUNYKY NIGHT STYLE 2025 | BY DJLOYREMiX',
    price: 800.00,
    brandname: 'PROJECT FUNYKY NIGHT STYLE 2025 | BY DJLOYREMiX',
    image: 'https://www.r9clubradio.com/uploads/products/addfde0ca8cc002fffb1dcfb8531a33d.png',
    created: '2025-08-13 19:55:27',
    counts: 445,
    products_status: 2,
    product_categorie_id: 30,
    link_music: 'https://youtu.be/b6hY9XJaX0M?si=0iX6Sy-Rrg1Tgh-l',
    link_download: 'https://drive.google.com/file/d/1_fyUIwH_HXcUv5V2NqzMFDFxhAXU9RIh/view?usp=sharing',
  },
  {
    id: 104,
    name: 'PRMiXz 2K25! PART.2 [ 150BPM ]',
    price: 300.00,
    brandname: 'หากซื้อแล้วห้ามแจกต่อหรือขายต่อใดๆทั้งสิ้น!!!',
    image: 'https://www.r9clubradio.com/uploads/products/cac9546c2cce18bf4069627c5c081f7d.png',
    created: '2025-09-28 17:12:49',
    counts: 155,
    products_status: 1,
    product_categorie_id: 1,
    link_music: 'https://soundcloud.com/djpeeremix/prmixz-breakmixz-320-kbps',
    link_download: 'https://drive.google.com/file/d/1uKTuMP3X9C7zhz3c-lxH0PcEhzitVm1Y/view?usp=sharing',
  },
  {
    id: 114,
    name: 'แมลงเม่าเหงาใจ - 150 - [ NOPREMIX_X ] (HBD)',
    price: 0.00,
    brandname: 'FREE DOWNLOAD',
    image: 'https://www.r9clubradio.com/uploads/products/532af34261ba64b35a4369f3464bd926.jpg',
    created: '2025-11-14 07:08:35',
    counts: 219,
    products_status: 2,
    product_categorie_id: 1,
    link_music: '-',
    link_download: 'https://drive.google.com/file/d/1hh1HBKTUx3ihXRIX3iq0Rl-hDtd0S3d3/view?usp=sharing',
  },
];

// Map old category IDs to new category names
const categoryMap: Record<number, string> = {
  1: 'ลูปเพลงแดนซ์',
  16: 'ลูปเพลง 3 ช่า',
  30: 'โปรเจคเพลง',
  31: 'ฟอนต์/กราฟิก',
};

// POST - Run migration (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, ensure categories exist
    const categoryIds: Record<string, string> = {};
    for (const [oldId, name] of Object.entries(categoryMap)) {
      // Check if category exists by name
      let category = await prisma.category.findFirst({
        where: { name },
      });
      
      if (!category) {
        // Create category
        category = await prisma.category.create({
          data: {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0E00-\u0E7F-]/g, ''),
            description: `หมวดหมู่ ${name}`,
          },
        });
      }
      categoryIds[oldId] = category.id;
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [] as string[],
    };

    for (const product of legacyProducts) {
      try {
        // Check if product with this title already exists
        const existingProduct = await prisma.product.findFirst({
          where: { title: product.name },
        });

        if (existingProduct) {
          results.skipped++;
          results.details.push(`⏭️ Skipped: ${product.name} (exists)`);
          continue;
        }

        // Extract artist from name (usually before the first separator)
        const artist = product.name.includes('-') 
          ? product.name.split('-')[0].trim()
          : product.name.includes('|')
            ? product.name.split('|')[0].trim()
            : 'R9Club Radio';

        // Create product
        await prisma.product.create({
          data: {
            title: product.name,
            artist: artist,
            description: product.brandname,
            price: product.price,
            coverImage: product.image,
            sampleAudioUrl: product.link_music.startsWith('#') || product.link_music === '-' 
              ? '' 
              : product.link_music,
            fullAudioUrl: product.link_download.startsWith('/') 
              ? '' 
              : product.link_download,
            categoryId: categoryIds[product.product_categorie_id.toString()] || null,
            isActive: product.products_status !== 0,
            isFeatured: product.price >= 250,
            playCount: product.counts,
            createdAt: new Date(product.created),
          },
        });

        results.imported++;
        results.details.push(`✅ Imported: ${product.name} (฿${product.price})`);
      } catch (error) {
        results.errors++;
        results.details.push(`❌ Error: ${product.name} - ${error}`);
      }
    }

    return Response.json({
      success: true,
      message: `Product migration completed: ${results.imported} imported, ${results.skipped} skipped, ${results.errors} errors`,
      total: legacyProducts.length,
      categoriesCreated: Object.keys(categoryIds).length,
      ...results,
    });
  } catch (error) {
    console.error('Product migration error:', error);
    return Response.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
