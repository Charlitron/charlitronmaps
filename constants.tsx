
import { Business } from './types';

export const CONTACT_EMAIL = "ventas@charlitron.com";
export const WHATSAPP_MAIN = "524444237092";
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=%2B${WHATSAPP_MAIN}&text=Hola, vengo de Charlitron Maps y necesito soporte o informes.`;

export const PRIVACY_POLICY = `
Responsable del tratamiento de datos:
Charlitron, con domicilio en Lanzagorta 330, colonia San Sebastián, San Luis Potosí, S.L.P., México, es responsable del tratamiento de los datos personales recabados a través de su plataforma web y móvil de localización y consulta de empresas y proveedores.

1. Datos personales que se recaban:
- Datos de identificación de usuarios.
- Datos de acceso y ubicación.
- Datos de empresas y proveedores (Nombre, RFC, Contacto).
- Datos técnicos (IP, Dispositivo).

2. Finalidades del tratamiento:
- Administrar cuentas y mostrar empresas en el mapa.
- Gestionar contratación de publicidad.
- Soporte técnico y estadísticas de uso.

3. Base jurídica y carácter público:
La información proviene de registros directos de proveedores o fuentes de acceso público permitidas por la ley.

4. Transferencias de datos:
Se comparten con proveedores tecnológicos (Cloud, Pagos) bajo medidas de seguridad. No se venden datos a terceros.

5. Derechos ARCO:
Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición enviando un correo a: ventas@charlitron.com.

6. Seguridad:
Charlitron implementa medidas administrativas y técnicas para proteger su información.
`;

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'SLP-001',
    name: 'NeoForge Industrias',
    sector: 'Industrial',
    category: 'Manufactura Pesada',
    description: 'Especialistas en fundición de precisión y aleaciones aeroespaciales. Líderes en el bajío.',
    address: 'Eje 124, Zona Industrial',
    city: 'San Luis Potosí',
    officePhone: '4441234567',
    whatsapp: '4448889900',
    email: 'contacto@neoforge.com',
    website: 'https://neoforge.com',
    services: ['Fundición', 'Maquinado CNC', 'Tratamiento Térmico'],
    gallery: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    ],
    x: 22.1150,
    y: -100.9050,
    rating: 4.8,
    status: 'active',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=forge',
    reliability: 98,
    isPremium: true,
    industrialCapacity: '150 Toneladas Mensuales'
  },
  {
    id: 'SLP-002',
    name: 'SkyNet Logística',
    sector: 'Logistica',
    category: 'Distribución Internacional',
    description: 'Red de transporte autónomo para última milla y carga pesada con monitoreo IA.',
    address: 'Av. Industrias 450, CP 78395',
    city: 'San Luis Potosí',
    officePhone: '4449876543',
    whatsapp: '4445556677',
    email: 'logistica@skynet.com',
    services: ['Transporte Autónomo', 'Almacén IA', 'Cross-docking'],
    gallery: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ],
    x: 22.1250,
    y: -100.9200,
    rating: 4.5,
    status: 'active',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=sky',
    reliability: 94,
    isPremium: true,
    industrialCapacity: 'Flota de 50 Unidades Pesadas'
  },
  {
    id: 'SLP-003',
    name: 'NeuroMed SLP',
    sector: 'Salud',
    category: 'Clínica de Especialidades',
    description: 'Centro avanzado de neurología y rehabilitación con tecnología robótica.',
    address: 'Lomas 4ta Sección',
    city: 'San Luis Potosí',
    officePhone: '4445556677',
    whatsapp: '4441112233',
    email: 'info@neuromed.mx',
    services: ['Neurología', 'RM 3T', 'Robótica'],
    gallery: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'],
    x: 22.1480,
    y: -101.0150,
    rating: 4.9,
    status: 'active',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=health',
    reliability: 99,
    isPremium: true,
    industrialCapacity: 'Atención 24/7'
  }
];
