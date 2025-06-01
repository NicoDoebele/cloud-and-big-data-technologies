{{/*
  Common helper templates
*/}}
{{- define "mongodb.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
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