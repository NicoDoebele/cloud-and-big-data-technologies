install:
	helm install mongo ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml

upgrade:
	helm upgrade mongo ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml

uninstall:
	helm uninstall mongo

clean:
	helm uninstall mongo
	kubectl delete pvc --all

template:
	helm template ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml

mongo-root:
	@kubectl exec -it $(pod) -- mongosh

mongo-admin:
	@kubectl exec -it $(pod) -- mongosh --username mongoadmin --password securepassword

deployment-status:
	@kubectl exec -it $(pod) -- mongosh --eval "sh.status()" --username mongoadmin --password securepassword
	@for i in $(shell seq 1 $(shards)); do \
		kubectl exec -it mongo-shard$$i-0 -- mongosh --eval "rs.status()"; \
	done