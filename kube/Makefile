install:
	helm install mongo ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml

upgrade:
	helm upgrade mongo ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml

uninstall:
	helm uninstall mongo

clean:
	helm uninstall mongo
	kubectl delete pvc --all

clean-volumes:
	kubectl delete pvc --all

template:
	helm template ./mongo-sharded-cluster -f ./mongo-sharded-cluster/values.yaml

cinder:
	kubectl create -f manifests/cinder-csi-plugin/csi-secret-cinderplugin.yaml
	kubectl -f manifests/cinder-csi-plugin/ apply

mongo-root:
	@kubectl exec -it $(pod) -- mongosh

mongos:
	@kubectl exec -it $$(kubectl get pods -l app=mongo-mongos -o jsonpath='{.items[0].metadata.name}') -- mongosh --username mongoadmin --password securepassword

deployment-status:
	@kubectl exec -it $(pod) -- mongosh --eval "sh.status()" --username mongoadmin --password securepassword
	@for i in $(shell seq 1 $(shards)); do \
		kubectl exec -it mongo-shard$$i-0 -- mongosh --eval "rs.status()"; \
	done

force-clean:
	kubectl delete pods --all -n default --grace-period=0 --force
	kubectl delete pvc --all