import { FileReportRepo } from './src/persistence/FileReportRepo';
import { ReportRequest } from './src/domains/ReportFilters';
import { AttendanceStatus } from './src/domains/AttendanceStatus';

// Test the FileReportRepo implementation
async function testFileReportRepo() {
  console.log(' Testing FileReportRepo...');
  
  const repo = new FileReportRepo();
  
  // Test basic report generation
  const request: ReportRequest = {
    filters: {
      relativePeriod: 'today'
    },
    aggregations: {
      includeCount: true,
      includePercentage: true
    },
    pagination: {
      page: 1,
      limit: 10
    },
    sorting: {
      sortBy: 'name',
      sortOrder: 'asc'
    },
    useCache: true
  };

  try {
    const result = await repo.generateReport(request);
    
    console.log(' Report generated successfully!');
    console.log(`- Report type: ${result.reportType}`);
    console.log(`- Total records: ${result.data.summary.totalRecords}`);
    console.log(`- Execution time: ${result.metrics.executionTimeMs}ms`);
    console.log(`- Cache hit: ${result.metrics.cacheHit}`);
    console.log(`- Query complexity: ${result.metrics.queryComplexity}`);
    
    // Test cache functionality
    const cachedResult = await repo.generateReport(request);
    console.log(`- Second query cache hit: ${cachedResult.metrics.cacheHit}`);
    
    // Test report config management
    const configId = repo.saveReportConfig('Daily Attendance', request);
    console.log(` Report config saved with ID: ${configId}`);
    
    const configs = repo.getAllReportConfigs();
    console.log(` Found ${configs.length} saved report configs`);
    
    console.log(' All tests passed!');
    
  } catch (error) {
    console.error(' Test failed:', error);
  }
}

// Run the test
testFileReportRepo().catch(console.error);
