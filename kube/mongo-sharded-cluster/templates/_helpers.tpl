{{/*
  Common helper templates
*/}}
{{- define "mongodb.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "mongo-sharded-cluster.labels" -}}
helm.sh/chart: {{ include "mongodb.chart" . }}
{{ include "mongodb.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "mongodb.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "mongodb.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mongodb.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "mongodb.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "mongodb.configDBString" -}}
{{- $rs := .Values.configServer.replicaSetName -}}
{{- $svc := .Values.configServer.headlessServiceName -}}
{{- $port := toString .Values.configServer.port -}}
{{- $ns := .Release.Namespace -}}
{{- $replicas := int .Values.replicaCount.configServers -}}
{{- $name := .Values.configServer.name -}}
{{- $hosts := list -}}
{{- range $i, $e := until $replicas -}}
{{- $host := printf "%s-%d.%s.%s.svc.cluster.local:%s" $name $i $svc $ns $port -}}
{{- $hosts = append $hosts $host -}}
{{- end -}}
{{- $result := printf "%s/%s" $rs (join "," $hosts) -}}
{{ $result -}}
{{- end -}}