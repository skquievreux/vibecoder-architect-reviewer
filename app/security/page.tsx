"use client";

import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import {
  Card,
  Title,
  Text,
  Badge,
  Button,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Metric,
  Flex,
  ProgressBar,
  Select,
  SelectItem,
} from "@tremor/react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface Vulnerability {
  id: string;
  severity: string;
  type: string;
  title: string;
  description: string;
  affectedPackage?: string;
  currentVersion?: string;
  fixedVersion?: string;
  cveId?: string;
  cvssScore?: number;
  status: string;
  detectedAt: string;
}

interface SecurityScan {
  id: string;
  repositoryId: string;
  scanType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  vulnerabilities: Vulnerability[];
  summary?: string;
}

export default function SecurityDashboard() {
  // searchParams removed
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedSeverity]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scansRes, vulnsRes] = await Promise.all([
        fetch("/api/security/scan?limit=10"),
        fetch(
          `/api/security/vulnerabilities?${selectedSeverity !== "all" ? `severity=${selectedSeverity}` : ""
          }`
        ),
      ]);

      if (scansRes.ok) {
        const scansData = await scansRes.json();
        setScans(scansData);
      }

      if (vulnsRes.ok) {
        const vulnsData = await vulnsRes.json();
        setVulnerabilities(vulnsData.vulnerabilities);
        setSummary(vulnsData.summary);
      }
    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerScan = async (repositoryId: string) => {
    setIsScanning(true);
    try {
      const response = await fetch("/api/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error triggering scan:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const updateVulnerabilityStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/security/vulnerabilities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error updating vulnerability:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "red";
      case "HIGH":
        return "orange";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge color="red">Open</Badge>;
      case "ACKNOWLEDGED":
        return <Badge color="yellow">Acknowledged</Badge>;
      case "FIXED":
        return <Badge color="green">Fixed</Badge>;
      case "IGNORED":
        return <Badge color="gray">Ignored</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateSecurityScore = () => {
    if (summary.total === 0) return 100;

    const penalty =
      summary.critical * 25 +
      summary.high * 15 +
      summary.medium * 5 +
      summary.low * 1;

    return Math.max(0, 100 - Math.min(penalty, 100));
  };

  const securityScore = calculateSecurityScore();
  const scoreColor =
    securityScore >= 90
      ? "green"
      : securityScore >= 75
        ? "blue"
        : securityScore >= 50
          ? "yellow"
          : "red";

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Title>Security Dashboard</Title>
        <Text>Monitor security vulnerabilities across your portfolio</Text>
      </div>

      {/* Security Score Overview */}
      <Grid numItems={1} numItemsMd={2} numItemsLg={5} className="gap-6 mb-6">
        <Card>
          <Flex alignItems="center" justifyContent="between">
            <div>
              <Text>Security Score</Text>
              <Metric>{securityScore}</Metric>
            </div>
            <Shield className={`w-12 h-12 text-${scoreColor}-500`} />
          </Flex>
          <ProgressBar
            value={securityScore}
            color={scoreColor as any}
            className="mt-3"
          />
        </Card>

        <Card>
          <Flex alignItems="center" justifyContent="between">
            <div>
              <Text>Critical</Text>
              <Metric>{summary.critical}</Metric>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="center" justifyContent="between">
            <div>
              <Text>High</Text>
              <Metric>{summary.high}</Metric>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="center" justifyContent="between">
            <div>
              <Text>Medium</Text>
              <Metric>{summary.medium}</Metric>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="center" justifyContent="between">
            <div>
              <Text>Low</Text>
              <Metric>{summary.low}</Metric>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-500" />
          </Flex>
        </Card>
      </Grid>

      {/* Vulnerabilities Table */}
      <Card className="mb-6">
        <Flex justifyContent="between" alignItems="center" className="mb-4">
          <div>
            <Title>Open Vulnerabilities</Title>
            <Text>Active security issues requiring attention</Text>
          </div>
          <div className="flex items-center space-x-3">
            <Select
              value={selectedSeverity}
              onValueChange={setSelectedSeverity}
              className="w-40"
            >
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </Select>
            <Button
              icon={RefreshCw}
              onClick={() => fetchData()}
              variant="secondary"
            >
              Refresh
            </Button>
          </div>
        </Flex>

        {vulnerabilities.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3" />
            <Title>No vulnerabilities found</Title>
            <Text>Your portfolio is secure</Text>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Severity</TableHeaderCell>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Package</TableHeaderCell>
                <TableHeaderCell>Current</TableHeaderCell>
                <TableHeaderCell>Fix Available</TableHeaderCell>
                <TableHeaderCell>CVE</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vulnerabilities.map((vuln) => (
                <TableRow key={vuln.id}>
                  <TableCell>
                    <Badge color={getSeverityColor(vuln.severity) as any}>
                      {vuln.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text className="font-medium">{vuln.title}</Text>
                    <Text className="text-xs text-slate-500 truncate max-w-xs">
                      {vuln.description}
                    </Text>
                  </TableCell>
                  <TableCell>{vuln.affectedPackage || "-"}</TableCell>
                  <TableCell>{vuln.currentVersion || "-"}</TableCell>
                  <TableCell>
                    {vuln.fixedVersion ? (
                      <Badge color="green">{vuln.fixedVersion}</Badge>
                    ) : (
                      <Text>-</Text>
                    )}
                  </TableCell>
                  <TableCell>
                    {vuln.cveId ? (
                      <a
                        href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vuln.cveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-violet-500 hover:text-violet-600"
                      >
                        {vuln.cveId}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(vuln.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {vuln.status === "OPEN" && (
                        <>
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() =>
                              updateVulnerabilityStatus(vuln.id, "ACKNOWLEDGED")
                            }
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="xs"
                            onClick={() =>
                              updateVulnerabilityStatus(vuln.id, "FIXED")
                            }
                          >
                            Mark Fixed
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Recent Scans */}
      <Card>
        <Title>Recent Security Scans</Title>
        <Text>History of security scans performed</Text>

        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Scan Type</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Vulnerabilities</TableHeaderCell>
              <TableHeaderCell>Started</TableHeaderCell>
              <TableHeaderCell>Completed</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scans.map((scan) => (
              <TableRow key={scan.id}>
                <TableCell>
                  <Badge>{scan.scanType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    color={
                      scan.status === "COMPLETED"
                        ? "green"
                        : scan.status === "RUNNING"
                          ? "blue"
                          : "red"
                    }
                  >
                    {scan.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {scan.vulnerabilities?.length || 0} found
                </TableCell>
                <TableCell>
                  {new Date(scan.startedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {scan.completedAt
                    ? new Date(scan.completedAt).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
