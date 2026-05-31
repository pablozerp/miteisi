const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seedeo de administradores...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // Crear Súper Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@unerg.edu.ve' },
    update: {},
    create: {
      email: 'superadmin@unerg.edu.ve',
      name: 'Súper Administrador',
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
      name: 'Administrador UNERG',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Usuarios de prueba creados:');
  console.log(`- SUPERADMIN: ${superAdmin.email} | Clave: 123456`);
  console.log(`- ADMIN: ${admin.email} | Clave: 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
