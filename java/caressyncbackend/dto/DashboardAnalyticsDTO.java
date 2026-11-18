package caressyncbackend.dto;


public class DashboardAnalyticsDTO {
    private long totalRecords;
    private long highRiskCount;
    private long offlineInferenceCount;
    private long onlineInferenceCount;
    private long childCasesCount;
    private long seniorCasesCount;

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public long getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(long highRiskCount) { this.highRiskCount = highRiskCount; }

    public long getOfflineInferenceCount() { return offlineInferenceCount; }
    public void setOfflineInferenceCount(long offlineInferenceCount) { this.offlineInferenceCount = offlineInferenceCount; }

    public long getOnlineInferenceCount() { return onlineInferenceCount; }
    public void setOnlineInferenceCount(long onlineInferenceCount) { this.onlineInferenceCount = onlineInferenceCount; }

    public long getChildCasesCount() { return childCasesCount; }
    public void setChildCasesCount(long childCasesCount) { this.childCasesCount = childCasesCount; }

    public long getSeniorCasesCount() { return seniorCasesCount; }
    public void setSeniorCasesCount(long seniorCasesCount) { this.seniorCasesCount = seniorCasesCount; }
}
