import cron from 'node-cron';
import { autoDeleteCompletedAgendas, sendReminderNotifications } from '@/app/(dashboard)/kesekretariatan/agenda/actions';
import { autoDeleteInactiveUmatData } from '@/app/(dashboard)/kesekretariatan/umat/actions';

// Fungsi untuk menginisialisasi scheduler
export function initScheduler() {
  // Jalankan auto-delete setiap hari Minggu jam 00:00
  cron.schedule('0 0 * * 0', async () => {
    try {
      const result = await autoDeleteCompletedAgendas();
    } catch (error) {
      console.error('Error in auto-delete scheduler:', error);
    }
  }, {
    timezone: 'Asia/Jakarta' // Sesuaikan dengan timezone Indonesia
  });

  // Jalankan pengingat setiap 3 hari sekali jam 00:00
  cron.schedule('0 0 */3 * *', async () => {
    try {
      const result = await sendReminderNotifications();
    } catch (error) {
      console.error('Error in reminder notifications scheduler:', error);
    }
  }, {
    timezone: 'Asia/Jakarta'
  });

  // Jalankan penghapusan otomatis data umat setiap awal bulan (tanggal 1) jam 00:00
  cron.schedule('0 0 1 * *', async () => {
    const startTime = new Date();
    
    try {
      console.log('=== CRONJOB AUTO-DELETE UMAT DATA STARTED ===');
      console.log(`Start time: ${startTime.toISOString()}`);
      console.log('Starting monthly auto-delete process for inactive umat data...');
      
      const result = await autoDeleteInactiveUmatData();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      console.log('=== CRONJOB AUTO-DELETE UMAT DATA COMPLETED ===');
      console.log(`End time: ${endTime.toISOString()}`);
      console.log(`Duration: ${duration}ms`);
      
      if (result.success) {
        console.log(`✅ Monthly auto-delete completed successfully:`);
        console.log(`   - Deleted families: ${result.deletedFamilies}`);
        console.log(`   - Deleted members: ${result.deletedMembers}`);
        console.log(`   - Total execution time: ${duration}ms`);
        
        if (result.errors.length > 0) {
          console.warn(`⚠️  Errors encountered during deletion: ${result.errors.length}`);
          result.errors.forEach((error, index) => {
            console.warn(`   ${index + 1}. ${error}`);
          });
        }
        
        // Log audit trail
        console.log('AUDIT TRAIL:', JSON.stringify({
          event: 'AUTO_DELETE_UMAT_DATA',
          timestamp: endTime.toISOString(),
          success: true,
          deletedFamilies: result.deletedFamilies,
          deletedMembers: result.deletedMembers,
          errors: result.errors,
          executionTimeMs: duration
        }));
        
      } else {
        console.error('❌ Monthly auto-delete failed:');
        result.errors.forEach((error, index) => {
          console.error(`   ${index + 1}. ${error}`);
        });
        
        // Log audit trail for failure
        console.log('AUDIT TRAIL:', JSON.stringify({
          event: 'AUTO_DELETE_UMAT_DATA',
          timestamp: endTime.toISOString(),
          success: false,
          deletedFamilies: 0,
          deletedMembers: 0,
          errors: result.errors,
          executionTimeMs: duration
        }));
      }
      
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      console.error('💥 CRITICAL ERROR in monthly auto-delete scheduler:');
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`   Duration before error: ${duration}ms`);
      
      // Log audit trail for critical error
      console.log('AUDIT TRAIL:', JSON.stringify({
        event: 'AUTO_DELETE_UMAT_DATA',
        timestamp: endTime.toISOString(),
        success: false,
        deletedFamilies: 0,
        deletedMembers: 0,
        errors: [error instanceof Error ? error.message : 'Unknown critical error'],
        executionTimeMs: duration,
        criticalError: true
      }));
    }
  }, {
    timezone: 'Asia/Jakarta'
  });
  
  console.log('✅ All schedulers initialized successfully');
  console.log('📅 Schedule summary:');
  console.log('   - Auto-delete completed agendas: Every Sunday at 00:00 WIB');
  console.log('   - Send reminder notifications: Every 3 days at 00:00 WIB');
  console.log('   - Auto-delete inactive umat data: 1st of every month at 00:00 WIB');
} 