const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seedeo de administradores...');

  const passwordHash = await bcrypt.hash('Admin@1234', 10);

  // Crear Súper Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@unerg.edu.ve' },
    update: {},
    create: {
      email: 'superadmin@unerg.edu.ve',
      firstName: 'Súper',
      lastName: 'Administrador',
      password: passwordHash,
      role: 'SUPERADMIN',
      isActive: true,
    },
  });

  // Crear Admin Normal
  const admin = await prisma.user.upsert({
    where: { email: 'admin@unerg.edu.ve' },
    update: {},
    create: {
      email: 'admin@unerg.edu.ve',
      firstName: 'Admin',
      lastName: 'UNERG',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Usuarios de prueba creados:');
  console.log(`- SUPERADMIN: superadmin@unerg.edu.ve | Clave: Admin@1234`);
  console.log(`- ADMIN: admin@unerg.edu.ve | Clave: Admin@1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
