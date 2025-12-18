package com.qa.system.repository;

import com.qa.system.entity.Qa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QaRepository extends JpaRepository<Qa, Long> {
}
